const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(path.join(__dirname, 'tracking.db'));

// ===== INICIALIZACIÓN DE BD =====
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS api_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_id TEXT NOT NULL,
      api_source TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      date DATE DEFAULT CURRENT_DATE,
      operator TEXT,
      route TEXT
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
      date DATE DEFAULT CURRENT_DATE,
      severity TEXT,
      operator TEXT,
      route TEXT
    )
  `);
});

// ===== HELPERS =====

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getSeverity = (distance) => {
  if (distance < 50) return 'ok';
  if (distance < 100) return 'warning';
  if (distance < 500) return 'critical';
  return 'severe';
};

const OPERATORS = ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Luis Rodríguez', 'Sofia Hernández', 'Pedro Sánchez', 'Laura Torres'];
const ROUTES = ['Ruta Norte', 'Ruta Sur', 'Ruta Centro', 'Ruta Este', 'Ruta Oeste', 'Ruta Industrial', 'Ruta Comercial'];
const UNITS = ['CAMION-001', 'CAMION-002', 'CAMION-003', 'CAMION-004', 'CAMION-005', 'CAMION-006', 'CAMION-007', 'CAMION-008', 'CAMION-009', 'CAMION-010', 'CAMION-011', 'CAMION-012', 'CAMION-015', 'CAMION-020', 'CAMION-024'];

// Generar datos históricos de los últimos 30 días
const generateHistoricalData = () => {
  return new Promise((resolve) => {
    db.serialize(() => {
      db.run('DELETE FROM api_records');
      db.run('DELETE FROM discrepancies', () => {
        const stmt = db.prepare(
          'INSERT INTO discrepancies (unit_id, distance_meters, api1_lat, api1_lng, api2_lat, api2_lng, timestamp, date, severity, operator, route) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        const stmtRecord = db.prepare(
          'INSERT INTO api_records (unit_id, api_source, latitude, longitude, timestamp, date, operator, route) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );

        const today = new Date();
        for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
          const date = new Date(today);
          date.setDate(date.getDate() - dayOffset);
          const dateStr = date.toISOString().split('T')[0];

          // Más actividad en días recientes
          const intensityFactor = dayOffset < 7 ? 1.5 : 1;
          const numEvents = Math.floor((Math.random() * 8 + 3) * intensityFactor);

          for (let i = 0; i < numEvents; i++) {
            const unit = UNITS[Math.floor(Math.random() * UNITS.length)];
            const operator = OPERATORS[Math.floor(Math.random() * OPERATORS.length)];
            const route = ROUTES[Math.floor(Math.random() * ROUTES.length)];

            const baseLat = 19.4326 + (Math.random() - 0.5) * 0.1; // CDMX
            const baseLng = -99.1332 + (Math.random() - 0.5) * 0.1;

            const offsetDistance = Math.random() < 0.3
              ? Math.random() * 50 // OK
              : Math.random() < 0.5
                ? 50 + Math.random() * 50 // Warning
                : Math.random() < 0.8
                  ? 100 + Math.random() * 400 // Critical
                  : 500 + Math.random() * 1000; // Severe

            const lat2 = baseLat + (offsetDistance / 111000) * (Math.random() - 0.5) * 2;
            const lng2 = baseLng + (offsetDistance / (111000 * Math.cos(baseLat * Math.PI / 180))) * (Math.random() - 0.5) * 2;

            const distance = calculateDistance(baseLat, baseLng, lat2, lng2);
            const severity = getSeverity(distance);

            const hour = Math.floor(Math.random() * 14) + 6; // 6am-8pm
            const minute = Math.floor(Math.random() * 60);
            const timestamp = `${dateStr} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;

            // Insertar registros de ambas APIs
            stmtRecord.run(unit, 'LogisticaFlow', baseLat, baseLng, timestamp, dateStr, operator, route);
            stmtRecord.run(unit, 'VehicleTrackPro', lat2, lng2, timestamp, dateStr, operator, route);

            // Solo insertar discrepancia si supera el threshold
            if (distance >= 50) {
              stmt.run(unit, distance, baseLat, baseLng, lat2, lng2, timestamp, dateStr, severity, operator, route);
            }
          }
        }

        stmt.finalize();
        stmtRecord.finalize(() => resolve());
      });
    });
  });
};

// ===== ENDPOINTS =====

// Generar datos históricos de prueba
app.post('/api/seed-data', async (req, res) => {
  try {
    await generateHistoricalData();
    res.json({ success: true, message: 'Datos históricos generados (últimos 30 días)' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sincronizar APIs en tiempo real (simulado)
app.get('/api/sync', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const stmt = db.prepare(
    'INSERT INTO discrepancies (unit_id, distance_meters, api1_lat, api1_lng, api2_lat, api2_lng, date, severity, operator, route) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  let discrepanciesAdded = 0;
  const numNew = Math.floor(Math.random() * 5) + 2;

  for (let i = 0; i < numNew; i++) {
    const unit = UNITS[Math.floor(Math.random() * UNITS.length)];
    const operator = OPERATORS[Math.floor(Math.random() * OPERATORS.length)];
    const route = ROUTES[Math.floor(Math.random() * ROUTES.length)];

    const baseLat = 19.4326 + (Math.random() - 0.5) * 0.1;
    const baseLng = -99.1332 + (Math.random() - 0.5) * 0.1;
    const offsetDistance = 50 + Math.random() * 800;
    const lat2 = baseLat + (offsetDistance / 111000) * (Math.random() - 0.5) * 2;
    const lng2 = baseLng + (offsetDistance / (111000 * Math.cos(baseLat * Math.PI / 180))) * (Math.random() - 0.5) * 2;
    const distance = calculateDistance(baseLat, baseLng, lat2, lng2);

    if (distance >= 50) {
      stmt.run(unit, distance, baseLat, baseLng, lat2, lng2, today, getSeverity(distance), operator, route);
      discrepanciesAdded++;
    }
  }

  stmt.finalize(() => {
    res.json({ success: true, discrepancies_added: discrepanciesAdded });
  });
});

// Resumen por rango de fechas
app.get('/api/summary', (req, res) => {
  const { startDate, endDate } = req.query;
  const start = startDate || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  const end = endDate || new Date().toISOString().split('T')[0];

  db.all(
    `SELECT
      date,
      COUNT(*) as total,
      SUM(CASE WHEN severity = 'warning' THEN 1 ELSE 0 END) as warnings,
      SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical,
      SUM(CASE WHEN severity = 'severe' THEN 1 ELSE 0 END) as severe,
      ROUND(AVG(distance_meters), 2) as avg_distance,
      MAX(distance_meters) as max_distance,
      COUNT(DISTINCT unit_id) as affected_units
    FROM discrepancies
    WHERE date BETWEEN ? AND ?
    GROUP BY date
    ORDER BY date ASC`,
    [start, end],
    (err, rows) => {
      if (err) res.status(500).json({ error: err.message });
      else res.json(rows);
    }
  );
});

// KPIs por rango de fechas
app.get('/api/kpis', (req, res) => {
  const { startDate, endDate } = req.query;
  const start = startDate || new Date().toISOString().split('T')[0];
  const end = endDate || new Date().toISOString().split('T')[0];

  db.get(
    `SELECT
      COUNT(*) as total_discrepancies,
      COUNT(DISTINCT unit_id) as affected_units,
      ROUND(AVG(distance_meters), 2) as avg_distance,
      MAX(distance_meters) as max_distance,
      SUM(CASE WHEN severity = 'warning' THEN 1 ELSE 0 END) as warnings,
      SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical,
      SUM(CASE WHEN severity = 'severe' THEN 1 ELSE 0 END) as severe
    FROM discrepancies
    WHERE date BETWEEN ? AND ?`,
    [start, end],
    (err, row) => {
      if (err) res.status(500).json({ error: err.message });
      else res.json(row || {});
    }
  );
});

// Top unidades con más discrepancias
app.get('/api/top-units', (req, res) => {
  const { startDate, endDate, limit } = req.query;
  const start = startDate || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const end = endDate || new Date().toISOString().split('T')[0];
  const lim = parseInt(limit) || 10;

  db.all(
    `SELECT
      unit_id,
      COUNT(*) as occurrences,
      ROUND(AVG(distance_meters), 2) as avg_distance,
      MAX(distance_meters) as max_distance,
      MIN(distance_meters) as min_distance
    FROM discrepancies
    WHERE date BETWEEN ? AND ?
    GROUP BY unit_id
    ORDER BY occurrences DESC
    LIMIT ?`,
    [start, end, lim],
    (err, rows) => {
      if (err) res.status(500).json({ error: err.message });
      else res.json(rows);
    }
  );
});

// Distribución por severidad
app.get('/api/severity-distribution', (req, res) => {
  const { startDate, endDate } = req.query;
  const start = startDate || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const end = endDate || new Date().toISOString().split('T')[0];

  db.all(
    `SELECT severity, COUNT(*) as count
    FROM discrepancies
    WHERE date BETWEEN ? AND ?
    GROUP BY severity`,
    [start, end],
    (err, rows) => {
      if (err) res.status(500).json({ error: err.message });
      else res.json(rows);
    }
  );
});

// Discrepancias por operador
app.get('/api/by-operator', (req, res) => {
  const { startDate, endDate } = req.query;
  const start = startDate || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const end = endDate || new Date().toISOString().split('T')[0];

  db.all(
    `SELECT
      operator,
      COUNT(*) as count,
      ROUND(AVG(distance_meters), 2) as avg_distance
    FROM discrepancies
    WHERE date BETWEEN ? AND ? AND operator IS NOT NULL
    GROUP BY operator
    ORDER BY count DESC`,
    [start, end],
    (err, rows) => {
      if (err) res.status(500).json({ error: err.message });
      else res.json(rows);
    }
  );
});

// Discrepancias por ruta
app.get('/api/by-route', (req, res) => {
  const { startDate, endDate } = req.query;
  const start = startDate || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const end = endDate || new Date().toISOString().split('T')[0];

  db.all(
    `SELECT
      route,
      COUNT(*) as count,
      ROUND(AVG(distance_meters), 2) as avg_distance
    FROM discrepancies
    WHERE date BETWEEN ? AND ? AND route IS NOT NULL
    GROUP BY route
    ORDER BY count DESC`,
    [start, end],
    (err, rows) => {
      if (err) res.status(500).json({ error: err.message });
      else res.json(rows);
    }
  );
});

// Discrepancias por hora del día
app.get('/api/by-hour', (req, res) => {
  const { startDate, endDate } = req.query;
  const start = startDate || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const end = endDate || new Date().toISOString().split('T')[0];

  db.all(
    `SELECT
      strftime('%H', timestamp) as hour,
      COUNT(*) as count
    FROM discrepancies
    WHERE date BETWEEN ? AND ?
    GROUP BY hour
    ORDER BY hour`,
    [start, end],
    (err, rows) => {
      if (err) res.status(500).json({ error: err.message });
      else res.json(rows);
    }
  );
});

// Historial detallado
app.get('/api/discrepancies', (req, res) => {
  const { startDate, endDate, limit, severity } = req.query;
  const start = startDate || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const end = endDate || new Date().toISOString().split('T')[0];
  const lim = parseInt(limit) || 200;

  let query = `SELECT * FROM discrepancies WHERE date BETWEEN ? AND ?`;
  const params = [start, end];

  if (severity && severity !== 'all') {
    query += ` AND severity = ?`;
    params.push(severity);
  }

  query += ` ORDER BY timestamp DESC LIMIT ?`;
  params.push(lim);

  db.all(query, params, (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

// Limpiar todo
app.post('/api/clear-data', (req, res) => {
  db.run('DELETE FROM api_records');
  db.run('DELETE FROM discrepancies', () => {
    res.json({ success: true });
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend running', timestamp: new Date() });
});

// Auto-generar datos al iniciar si la BD está vacía
db.get('SELECT COUNT(*) as count FROM discrepancies', async (err, row) => {
  if (!err && row.count === 0) {
    console.log('📊 Generando datos históricos iniciales...');
    await generateHistoricalData();
    console.log('✅ Datos generados');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
