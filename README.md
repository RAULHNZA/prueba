# 🚛 Dashboard de Tracking - Detección de Discrepancias de Ubicación

Sistema de monitoreo que compara ubicaciones de vehículos/unidades entre dos APIs de logística para detectar inconsistencias y alertas.

## 📋 Características

- **Comparación de APIs**: Conecta dos fuentes de datos diferentes
- **Detección de Discrepancias**: Identifica cuando una unidad está en coordenadas diferentes entre APIs
- **Rango de Tolerancia**: 50-100m considera alerta, >100m es crítico
- **Dashboard Visual**: Gráficas y tablas en tiempo real con React
- **Base de Datos Local**: Almacenamiento en SQLite (exportable a SharePoint)
- **APIs Simuladas**: Datos de prueba para demostración

## 🚀 Inicio Rápido

### Instalación de Dependencias

```bash
npm run install-all
```

### Ejecutar en Desarrollo

**Opción 1: Ejecutar ambos servidores juntos**
```bash
npm run dev
```

**Opción 2: Ejecutar por separado**

Terminal 1 - Backend:
```bash
cd backend
npm start
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### Acceso

- **Dashboard**: http://localhost:3000
- **API Backend**: http://localhost:5000

## 📊 Funcionalidades

### Botones de Control

- **🔄 Sincronizar APIs**: Extrae datos de ambas APIs, compara coordenadas y guarda discrepancias
- **🗑️ Limpiar Datos**: Elimina todos los registros (útil para pruebas)

### Visualizaciones

1. **KPIs** (Key Performance Indicators):
   - Discrepancias de hoy
   - Unidades afectadas
   - Distancia promedio
   - Distancia máxima

2. **Gráfico de Discrepancias por Día**: Muestra tendencias históricas

3. **Lista de Unidades con Problemas**: Ordena por severidad
   - 🟡 Alerta: 50-100m
   - 🔴 Crítico: >100m

4. **Historial Completo**: Tabla con todos los registros

## 🗄️ Base de Datos

Los datos se almacenan en `backend/tracking.db` (SQLite)

### Tablas:
- `api_records`: Registros de ambas APIs
- `discrepancies`: Discrepancias detectadas

### Para migrar a SharePoint:
1. Exporta `tracking.db` desde `/backend/`
2. Crea una lista o documento en SharePoint
3. Importa los datos usando herramientas de integración

## 🔧 Configuración de APIs

### Estructura Actual (Simulada):
```javascript
{
  unit_id: 'CAMION-001',
  latitude: 40.7128,
  longitude: -74.0060,
  timestamp: '2026-05-18T...'
}
```

### Para Conectar APIs Reales:

Edita `backend/server.js` - Reemplaza `mockAPI1()` y `mockAPI2()` con llamadas reales:

```javascript
const data1 = await fetch('https://api1.example.com/vehicles').then(r => r.json())
const data2 = await fetch('https://api2.example.com/locations').then(r => r.json())
```

## 📐 Lógica de Comparación

Se usa la **fórmula de Haversine** para calcular distancias entre coordenadas (lat/lng):
- Distancia < 50m: ✅ Coincidencia exacta
- Distancia 50-100m: ⚠️ Alerta
- Distancia > 100m: 🔴 Crítico

## 🛠️ Stack Tecnológico

### Backend
- **Express.js**: Servidor HTTP
- **SQLite3**: Base de datos local
- **CORS**: Comunicación con frontend

### Frontend
- **React 19**: UI interactiva
- **Vite**: Bundler rápido
- **Recharts**: Gráficas
- **CSS3**: Estilos responsivos

## 📝 Próximos Pasos

1. Conectar con APIs reales (reemplazar datos simulados)
2. Añadir autenticación si es necesario
3. Exportar/integrar con SharePoint
4. Configurar notificaciones automáticas
5. Agregar filtros por fecha, rango de distancia, operador

## 📧 Soporte

Para cambios en endpoints, estructura de datos o nuevas features, edita los archivos en:
- Backend: `backend/server.js`
- Frontend: `frontend/src/components/`

## 📜 Licencia

Proyecto privado - Uso interno
