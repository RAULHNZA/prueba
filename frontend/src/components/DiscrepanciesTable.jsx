import React, { useState, useMemo } from 'react'
import './DiscrepanciesTable.css'

const SEVERITY_CONFIG = {
  warning: { label: 'Alerta', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' },
  critical: { label: 'Crítica', color: '#f87171', bg: 'rgba(248, 113, 113, 0.15)' },
  severe: { label: 'Severa', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' },
  ok: { label: 'OK', color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)' },
}

function DiscrepanciesTable({ data }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let result = data || []
    if (filter !== 'all') {
      result = result.filter((d) => d.severity === filter)
    }
    if (search) {
      const s = search.toLowerCase()
      result = result.filter(
        (d) =>
          d.unit_id?.toLowerCase().includes(s) ||
          d.operator?.toLowerCase().includes(s) ||
          d.route?.toLowerCase().includes(s)
      )
    }
    return result
  }, [data, filter, search])

  const formatDate = (timestamp) => {
    const d = new Date(timestamp)
    return d.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="discrepancies-table glass">
      <div className="table-header">
        <div>
          <h3 className="table-title">Registro Detallado de Discrepancias</h3>
          <p className="table-subtitle">
            Mostrando <strong>{filtered.length}</strong> de {data?.length || 0} registros
          </p>
        </div>

        <div className="table-controls">
          <div className="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Buscar unidad, operador, ruta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-tabs">
            {['all', 'warning', 'critical', 'severe'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilter(sev)}
                className={`filter-tab ${filter === sev ? 'active' : ''}`}
                style={
                  filter === sev && sev !== 'all'
                    ? { background: SEVERITY_CONFIG[sev]?.bg, color: SEVERITY_CONFIG[sev]?.color }
                    : {}
                }
              >
                {sev === 'all' ? 'Todas' : SEVERITY_CONFIG[sev]?.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        {filtered.length === 0 ? (
          <div className="empty-table">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" opacity="0.3">
              <path
                d="M9 11L12 14L20 6M21 12V19A2 2 0 0119 21H5A2 2 0 013 19V5A2 2 0 015 3H16"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p>No hay discrepancias que mostrar</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Unidad</th>
                <th>Severidad</th>
                <th>Distancia</th>
                <th>Operador</th>
                <th>Ruta</th>
                <th>API 1 (Lat, Lng)</th>
                <th>API 2 (Lat, Lng)</th>
                <th>Fecha/Hora</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => {
                const config = SEVERITY_CONFIG[item.severity] || SEVERITY_CONFIG.ok
                return (
                  <tr key={item.id || idx} style={{ animationDelay: `${idx * 0.02}s` }}>
                    <td>
                      <span className="unit-tag">{item.unit_id}</span>
                    </td>
                    <td>
                      <span
                        className="severity-pill"
                        style={{ background: config.bg, color: config.color, borderColor: config.color }}
                      >
                        {config.label}
                      </span>
                    </td>
                    <td>
                      <div className="distance-cell">
                        <span className="distance-value">{Math.round(item.distance_meters)}m</span>
                        <div
                          className="distance-bar"
                          style={{
                            width: `${Math.min((item.distance_meters / 1000) * 100, 100)}%`,
                            background: config.color,
                          }}
                        ></div>
                      </div>
                    </td>
                    <td className="text-muted">{item.operator || '—'}</td>
                    <td>
                      <span className="route-tag">{item.route || '—'}</span>
                    </td>
                    <td className="coords">
                      {item.api1_lat?.toFixed(4)}, {item.api1_lng?.toFixed(4)}
                    </td>
                    <td className="coords">
                      {item.api2_lat?.toFixed(4)}, {item.api2_lng?.toFixed(4)}
                    </td>
                    <td className="text-muted timestamp-cell">{formatDate(item.timestamp)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default DiscrepanciesTable
