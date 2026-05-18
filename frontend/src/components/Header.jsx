import React from 'react'
import './Header.css'

function Header({ onRefresh, onRegenerate, refreshing }) {
  return (
    <header className="dashboard-header glass-strong">
      <div className="header-left">
        <div className="logo">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#logoGradient)" />
            <path
              d="M14 24 L18 28 L26 18 M30 30 L34 30 M30 24 L34 24"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <circle cx="24" cy="38" r="2" fill="white" />
          </svg>
        </div>
        <div>
          <h1 className="logo-title">
            FleetTrack <span className="title-accent">Analytics</span>
          </h1>
          <p className="logo-subtitle">Sistema de Detección de Discrepancias en Tiempo Real</p>
        </div>
      </div>

      <div className="header-actions">
        <button onClick={onRefresh} disabled={refreshing} className="btn-action btn-sync">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={refreshing ? 'spin' : ''}>
            <path
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zm0 0V8m0 4h-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M3 12V16M3 12H7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          {refreshing ? 'Sincronizando...' : 'Sincronizar APIs'}
        </button>

        <button onClick={onRegenerate} className="btn-action btn-regenerate">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Regenerar Datos
        </button>
      </div>
    </header>
  )
}

export default Header
