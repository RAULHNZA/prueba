const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Inicializar base de datos SQLite
const db = new sqlite3.Database(path.join(__dirname, 'tracking.db'));

// Crear tablas
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS api_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_id TEXT NOT NULL,
      api_source TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      date DATE DEFAULT CURRENT_DATE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS discrepancies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_id TEXT NOT NULL,
      distance_meters REAL NOT NULL,
      api1_lat REAL NOT NULL,
      api1_lng REAL NOT NULL,
      api2_lat REAL NOT NULL,
      api2_lng REAL NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      date DATE DEFAULT CURRENT_DATE
    )
  `);
});

// ===== SIMULACIÓN DE DOS APIs =====

// API 1: LogisticaFlow
const mockAPI1 = () => [
  { unit_id: 'CAMION-001', latitude: 40.7128, longitude: -74.0060, timestamp: new Date() },
  { unit_id: 'CAMION-002', latitude: 40.7250, longitude: -73.9950, timestamp: new Date() },
  { unit_id: 'CAMION-003', latitude: 40.7300, longitude: -73.9850, timestamp: new Date() },
  { unit_id: 'CAMION-004', latitude: 40.7400, longitude: -73.9750, timestamp: new Date() },
  { unit_id: 'CAMION-005', latitude: 40.7500, longitude: -73.9650, timestamp: new Date() },
];

// API 2: VehicleTrackPro - Con algunas discrepancias intencionales
const mockAPI2 = () => [
  { unit_id: 'CAMION-001', latitude: 40.7128, longitude: -74.0060, timestamp: new Date() },
  { unit_id: 'CAMION-002', latitude: 40.7260, longitude: -73.9945, timestamp: new Date() }, // ~140m de diferencia
  { unit_id: 'CAMION-003', latitude: 40.7310, longitude: -73.9840, timestamp: new Date() }, // ~120m de diferencia
  { unit_id: 'CAMION-004', latitude: 40.7400, longitude: -73.9750, timestamp: new Date() },
  { unit_id: 'CAMION-006', latitude: 40.7600, longitude: -73.9550, timestamp: new Date() }, // Diferente unidad
];

// Función para calcular distancia entre dos puntos (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// ===== ENDPOINTS =====

// Endpoint para obtener datos de ambas APIs y compararlas
app.get('/api/sync', (req, res) => {
  try {
    const data1 = mockAPI1();
    const data2 = mockAPI2();

    // Crear mapas de unidades
    const map1 = new Map(data1.map(d => [d.unit_id, d]));
    const map2 = new Map(data2.map(d => [d.unit_id, d]));

    // Almacenar registros
    data1.forEach(record => {
      db.run(
        'INSERT INTO api_records (unit_id, api_source, latitude, longitude) VALUES (?, ?, ?, ?)',
        [record.unit_id, 'LogisticaFlow', record.latitude, record.longitude]
      );
    });

    data2.forEach(record => {
      db.run(
        'INSERT INTO api_records (unit_id, api_source, latitude, longitude) VALUES (?, ?, ?, ?)',
        [record.unit_id, 'VehicleTrackPro', record.latitude, record.longitude]
      );
    });

    // Comparar y detectar discrepancias
    const discrepancies = [];
    const allUnits = new Set([...map1.keys(), ...map2.keys()]);

    allUnits.forEach(unitId => {
      const record1 = map1.get(unitId);
      const record2 = map2.get(unitId);

      if (record1 && record2) {
        const distance = calculateDistance(
          record1.latitude,
          record1.longitude,
          record2.latitude,
          record2.longitude
        );

        if (distance > 50) { // Threshold de 50 metros
          discrepancies.push({
            unit_id: unitId,
            distance_meters: Math.round(distance),
            api1_lat: record1.latitude,
            api1_lng: record1.longitude,
            api2_lat: record2.latitude,
            api2_lng: record2.longitude,
          });

          // Guardar en BD
          db.run(
            'INSERT INTO discrepancies (unit_id, distance_meters, api1_lat, api1_lng, api2_lat, api2_lng) VALUES (?, ?, ?, ?, ?, ?)',
            [unitId, distance, record1.latitude, record1.longitude, record2.latitude, record2.longitude]
          );
        }
      }
    });

    res.json({
      success: true,
      api1_records: data1.length,
      api2_records: data2.length,
      discrepancies_found: discrepancies.length,
      discrepancies,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para obtener discrepancias por día
app.get('/api/discrepancies-summary', (req, res) => {
  db.all(
    `SELECT
      date,
      COUNT(*) as count,
      ROUND(AVG(distance_meters), 2) as avg_distance,
      COUNT(DISTINCT unit_id) as affected_units
    FROM discrepancies
    GROUP BY date
    ORDER BY date DESC`,
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(rows);
      }
    }
  );
});

// Endpoint para obtener unidades con problemas hoy
app.get('/api/today-discrepancies', (req, res) => {
  db.all(
    `SELECT
      unit_id,
      COUNT(*) as occurrences,
      ROUND(AVG(distance_meters), 2) as avg_distance,
      MAX(distance_meters) as max_distance
    FROM discrepancies
    WHERE date = CURRENT_DATE
    GROUP BY unit_id
    ORDER BY occurrences DESC`,
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(rows);
      }
    }
  );
});

// Endpoint para obtener historial completo
app.get('/api/all-discrepancies', (req, res) => {
  db.all(
    `SELECT * FROM discrepancies ORDER BY timestamp DESC LIMIT 100`,
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(rows);
      }
    }
  );
});

// Endpoint para limpiar datos
app.post('/api/clear-data', (req, res) => {
  db.run('DELETE FROM api_records');
  db.run('DELETE FROM discrepancies', () => {
    res.json({ success: true });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend running', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard will be at http://localhost:3000`);
});
