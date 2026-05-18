import React, { useState } from 'react'
import './DateRangeSelector.css'

const PRESETS = [
  { id: 'today', label: 'Hoy', days: 0 },
  { id: 'yesterday', label: 'Ayer', days: 1, single: true },
  { id: '7days', label: 'Últimos 7 días', days: 7 },
  { id: '14days', label: 'Últimos 14 días', days: 14 },
  { id: '30days', label: 'Últimos 30 días', days: 30 },
]

function DateRangeSelector({ dateRange, onChange }) {
  const [showCustom, setShowCustom] = useState(false)
  const [customStart, setCustomStart] = useState(dateRange.startDate)
  const [customEnd, setCustomEnd] = useState(dateRange.endDate)

  const handlePreset = (preset) => {
    const today = new Date()
    let startDate, endDate

    if (preset.id === 'today') {
      startDate = today.toISOString().split('T')[0]
      endDate = today.toISOString().split('T')[0]
    } else if (preset.single) {
      const date = new Date(today)
      date.setDate(date.getDate() - preset.days)
      startDate = date.toISOString().split('T')[0]
      endDate = date.toISOString().split('T')[0]
    } else {
      const startDateObj = new Date(today)
      startDateObj.setDate(startDateObj.getDate() - preset.days)
      startDate = startDateObj.toISOString().split('T')[0]
      endDate = today.toISOString().split('T')[0]
    }

    onChange({ startDate, endDate, preset: preset.id })
    setShowCustom(false)
  }

  const applyCustom = () => {
    if (customStart && customEnd) {
      onChange({ startDate: customStart, endDate: customEnd, preset: 'custom' })
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="date-range-selector glass">
      <div className="selector-header">
        <div className="selector-info">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="3" stroke="url(#dateGrad)" strokeWidth="2" />
            <path d="M8 2V6M16 2V6M3 10H21" stroke="url(#dateGrad)" strokeWidth="2" strokeLinecap="round" />
            <defs>
              <linearGradient id="dateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <div>
            <h3>Rango de Análisis</h3>
            <p className="current-range">
              {dateRange.startDate === dateRange.endDate
                ? formatDate(dateRange.startDate)
                : `${formatDate(dateRange.startDate)} → ${formatDate(dateRange.endDate)}`}
            </p>
          </div>
        </div>
      </div>

      <div className="preset-buttons">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePreset(preset)}
            className={`preset-btn ${dateRange.preset === preset.id ? 'active' : ''}`}
          >
            {preset.label}
          </button>
        ))}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className={`preset-btn custom-btn ${dateRange.preset === 'custom' ? 'active' : ''}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Personalizado
        </button>
      </div>

      {showCustom && (
        <div className="custom-range">
          <div className="date-input-group">
            <label>Desde</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              max={customEnd}
            />
          </div>
          <div className="date-input-group">
            <label>Hasta</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              min={customStart}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <button onClick={applyCustom} className="btn-apply">
            Aplicar
          </button>
        </div>
      )}
    </div>
  )
}

export default DateRangeSelector
