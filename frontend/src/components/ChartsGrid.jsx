import React from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts'
import './ChartsGrid.css'

const COLORS = {
  green: '#10b981',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  warning: '#fbbf24',
  critical: '#f87171',
  severe: '#ec4899',
  ok: '#34d399',
}

const SEVERITY_COLORS = {
  warning: COLORS.warning,
  critical: COLORS.critical,
  severe: COLORS.severe,
  ok: COLORS.ok,
}

const SEVERITY_LABELS = {
  warning: 'Alerta (50-100m)',
  critical: 'Crítica (100-500m)',
  severe: 'Severa (>500m)',
  ok: 'Normal',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} className="tooltip-value" style={{ color: entry.color }}>
            <span className="tooltip-dot" style={{ background: entry.color }}></span>
            {entry.name}: <strong>{entry.value}</strong>
          </p>
        ))}
      </div>
    )
  }
  return null
}

function ChartsGrid({ data, dateRange }) {
  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
  }

  const summaryData = (data.summary || []).map((d) => ({
    fecha: formatDate(d.date),
    Total: d.total,
    Alertas: d.warnings,
    Críticas: d.critical,
    Severas: d.severe,
    avgDist: d.avg_distance,
  }))

  const severityData = (data.severity || []).map((d) => ({
    name: SEVERITY_LABELS[d.severity] || d.severity,
    value: d.count,
    severity: d.severity,
  }))

  const topUnitsData = (data.topUnits || []).slice(0, 8).map((d) => ({
    name: d.unit_id,
    Ocurrencias: d.occurrences,
    'Distancia Prom.': Math.round(d.avg_distance),
  }))

  const operatorData = (data.byOperator || []).slice(0, 8).map((d) => ({
    name: d.operator,
    discrepancias: d.count,
  }))

  const hourData = (data.byHour || []).map((d) => ({
    hora: `${d.hour}:00`,
    eventos: d.count,
  }))

  const routeData = (data.byRoute || []).map((d) => ({
    name: d.route,
    value: d.count,
  }))

  return (
    <div className="charts-grid">
      {/* Gráfico principal: Tendencia */}
      <div className="chart-card glass chart-large">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Tendencia de Discrepancias</h3>
            <p className="chart-subtitle">Evolución diaria por nivel de severidad</p>
          </div>
          <div className="chart-badge gradient-green-blue">📈 Histórico</div>
        </div>
        <div className="chart-body">
          {summaryData.length === 0 ? (
            <div className="no-data">Sin datos en este rango</div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={summaryData}>
                <defs>
                  <linearGradient id="colorAlertas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.warning} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={COLORS.warning} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCriticas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.critical} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={COLORS.critical} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSeveras" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.severe} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={COLORS.severe} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="fecha" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 13, paddingTop: 10 }} />
                <Area
                  type="monotone"
                  dataKey="Alertas"
                  stroke={COLORS.warning}
                  fillOpacity={1}
                  fill="url(#colorAlertas)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="Críticas"
                  stroke={COLORS.critical}
                  fillOpacity={1}
                  fill="url(#colorCriticas)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="Severas"
                  stroke={COLORS.severe}
                  fillOpacity={1}
                  fill="url(#colorSeveras)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Distribución por Severidad */}
      <div className="chart-card glass">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Distribución de Severidad</h3>
            <p className="chart-subtitle">Total acumulado del rango</p>
          </div>
        </div>
        <div className="chart-body">
          {severityData.length === 0 ? (
            <div className="no-data">Sin datos</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  innerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={4}
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.severity]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Unidades */}
      <div className="chart-card glass chart-large">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Top Unidades con Discrepancias</h3>
            <p className="chart-subtitle">Camiones con más eventos detectados</p>
          </div>
          <div className="chart-badge gradient-blue-purple">🚛 Ranking</div>
        </div>
        <div className="chart-body">
          {topUnitsData.length === 0 ? (
            <div className="no-data">Sin datos</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topUnitsData} layout="vertical" margin={{ left: 10 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={COLORS.green} />
                    <stop offset="50%" stopColor={COLORS.blue} />
                    <stop offset="100%" stopColor={COLORS.purple} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" tick={{ fontSize: 11 }} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Ocurrencias" fill="url(#barGradient)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Eventos por Hora */}
      <div className="chart-card glass">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Patrón Horario</h3>
            <p className="chart-subtitle">Distribución por hora del día</p>
          </div>
        </div>
        <div className="chart-body">
          {hourData.length === 0 ? (
            <div className="no-data">Sin datos</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={hourData}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={COLORS.purple} />
                    <stop offset="100%" stopColor={COLORS.blue} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="hora" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="eventos"
                  stroke="url(#lineGradient)"
                  strokeWidth={3}
                  dot={{ fill: COLORS.purple, r: 5, strokeWidth: 2, stroke: 'white' }}
                  activeDot={{ r: 7, fill: COLORS.blue }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Operadores */}
      <div className="chart-card glass">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Por Operador</h3>
            <p className="chart-subtitle">Discrepancias por chofer</p>
          </div>
        </div>
        <div className="chart-body">
          {operatorData.length === 0 ? (
            <div className="no-data">Sin datos</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={operatorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={70} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="discrepancias" fill={COLORS.green} radius={[8, 8, 0, 0]}>
                  {operatorData.map((entry, idx) => (
                    <Cell key={idx} fill={[COLORS.green, COLORS.blue, COLORS.purple][idx % 3]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Rutas */}
      <div className="chart-card glass">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Por Ruta</h3>
            <p className="chart-subtitle">Rutas con más incidencias</p>
          </div>
        </div>
        <div className="chart-body">
          {routeData.length === 0 ? (
            <div className="no-data">Sin datos</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={routeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {routeData.map((entry, index) => {
                    const palette = [COLORS.green, COLORS.blue, COLORS.purple, '#06b6d4', '#0ea5e9', '#a855f7', '#22d3ee']
                    return <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
                  })}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChartsGrid
