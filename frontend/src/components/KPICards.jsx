import React from 'react'
import './KPICards.css'

function KPICards({ kpis }) {
  const cards = [
    {
      label: 'Total Discrepancias',
      value: kpis.total_discrepancies || 0,
      subtitle: 'eventos detectados',
      gradient: 'green',
      icon: (
        <path d="M9 11L12 14L20 6M21 12V19A2 2 0 0119 21H5A2 2 0 013 19V5A2 2 0 015 3H16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      ),
    },
    {
      label: 'Unidades Afectadas',
      value: kpis.affected_units || 0,
      subtitle: 'camiones únicos',
      gradient: 'blue',
      icon: (
        <>
          <path d="M3 17H21M3 11H21M3 5H21" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <circle cx="6" cy="17" r="2" fill="white" />
          <circle cx="18" cy="11" r="2" fill="white" />
        </>
      ),
    },
    {
      label: 'Distancia Promedio',
      value: `${Math.round(kpis.avg_distance || 0)}m`,
      subtitle: 'de diferencia',
      gradient: 'purple',
      icon: (
        <>
          <path d="M12 2C8 2 5 5 5 9C5 14 12 22 12 22S19 14 19 9C19 5 16 2 12 2Z" stroke="white" strokeWidth="2" strokeLinejoin="round" fill="none" />
          <circle cx="12" cy="9" r="2.5" fill="white" />
        </>
      ),
    },
    {
      label: 'Distancia Máxima',
      value: `${Math.round(kpis.max_distance || 0)}m`,
      subtitle: 'discrepancia mayor',
      gradient: 'mixed',
      icon: (
        <>
          <path d="M12 2L4 22H20L12 2Z" stroke="white" strokeWidth="2" strokeLinejoin="round" fill="none" />
          <path d="M12 9V14" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="17" r="1" fill="white" />
        </>
      ),
    },
  ]

  const severityCards = [
    {
      label: 'Alertas',
      value: kpis.warnings || 0,
      color: '#fbbf24',
      bg: 'rgba(251, 191, 36, 0.1)',
      description: '50-100m',
    },
    {
      label: 'Críticas',
      value: kpis.critical || 0,
      color: '#f87171',
      bg: 'rgba(248, 113, 113, 0.1)',
      description: '100-500m',
    },
    {
      label: 'Severas',
      value: kpis.severe || 0,
      color: '#ec4899',
      bg: 'rgba(236, 72, 153, 0.1)',
      description: '> 500m',
    },
  ]

  return (
    <div className="kpi-section">
      <div className="kpi-grid">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`kpi-card glass kpi-${card.gradient}`}
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className="kpi-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                {card.icon}
              </svg>
            </div>
            <div className="kpi-content">
              <div className="kpi-label">{card.label}</div>
              <div className="kpi-value">{card.value}</div>
              <div className="kpi-subtitle">{card.subtitle}</div>
            </div>
            <div className="kpi-decoration"></div>
          </div>
        ))}
      </div>

      <div className="severity-summary glass">
        <h3 className="severity-title">Distribución por Severidad</h3>
        <div className="severity-cards">
          {severityCards.map((card, idx) => (
            <div
              key={idx}
              className="severity-card"
              style={{ background: card.bg, borderColor: card.color }}
            >
              <div className="severity-indicator" style={{ background: card.color }}></div>
              <div>
                <div className="severity-value" style={{ color: card.color }}>
                  {card.value}
                </div>
                <div className="severity-label">{card.label}</div>
                <div className="severity-desc">{card.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default KPICards
