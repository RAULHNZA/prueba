import React, { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const [loading, setLoading] = useState(false)

  const syncAPIs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/sync', { method: 'GET' })
      const data = await response.json()
      if (data.success) {
        alert(`✅ Sincronización completada!\n\nAPI1: ${data.api1_records} registros\nAPI2: ${data.api2_records} registros\nDiscrepancias encontradas: ${data.discrepancies_found}`)
        window.location.reload()
      }
    } catch (error) {
      alert('❌ Error al sincronizar: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const clearData = async () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar todos los datos?')) {
      try {
        await fetch('/api/clear-data', { method: 'POST' })
        alert('✅ Datos limpiados')
        window.location.reload()
      } catch (error) {
        alert('❌ Error: ' + error.message)
      }
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🚛 Dashboard de Tracking - Detección de Discrepancias</h1>
        <p>Comparación de ubicaciones entre dos APIs de logística</p>
        <div className="controls">
          <button onClick={syncAPIs} disabled={loading} className="btn btn-primary">
            {loading ? '⏳ Sincronizando...' : '🔄 Sincronizar APIs'}
          </button>
          <button onClick={clearData} className="btn btn-danger">
            🗑️ Limpiar Datos
          </button>
        </div>
      </header>
      <Dashboard />
    </div>
  )
}

export default App
