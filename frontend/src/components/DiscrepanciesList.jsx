import React from 'react'
import './DiscrepanciesList.css'

function DiscrepanciesList({ data }) {
  if (!data || data.length === 0) {
    return (
      <p style={{ textAlign: 'center', color: '#999', padding: '30px' }}>
        ✅ No hay discrepancias hoy
      </p>
    )
  }

  return (
    <div className="list">
      {data.map((item, idx) => (
        <div
          key={idx}
          className={`list-item ${item.max_distance > 100 ? 'critical' : 'warning'}`}
        >
          <div className="item-main">
            <div className="unit-name">{item.unit_id}</div>
            <div className="item-stats">
              <span className="stat">
                <strong>{item.occurrences}</strong> ocurrencias
              </span>
              <span className="stat">
                Promedio: <strong>{Math.round(item.avg_distance)}m</strong>
              </span>
              <span className="stat">
                Máximo: <strong>{Math.round(item.max_distance)}m</strong>
              </span>
            </div>
          </div>
          <div className="indicator">
            {item.max_distance > 100 ? '🔴' : '🟡'}
          </div>
        </div>
      ))}
    </div>
  )
}

export default DiscrepanciesList
