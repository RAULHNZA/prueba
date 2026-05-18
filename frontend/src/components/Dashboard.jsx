import React, { useState, useEffect } from 'react'
import DiscrepanciesChart from './DiscrepanciesChart'
import DiscrepanciesList from './DiscrepanciesList'
import './Dashboard.css'

function Dashboard() {
  const [summary, setSummary] = useState([])
  const [todayData, setTodayData] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
    // Recargar datos cada 10 segundos
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [summaryRes, todayRes, historyRes] = await Promise.all([
        fetch('/api/discrepancies-summary'),
        fetch('/api/today-discrepancies'),
        fetch('/api/all-discrepancies'),
      ])

      const summaryData = await summaryRes.json()
      const todayData = await todayRes.json()
      const historyData = await historyRes.json()

      setSummary(summaryData)
      setTodayData(todayData)
      setHistory(historyData)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const todayTotal = todayData.reduce((sum, item) => sum + item.occurrences, 0)
  const todayUnits = todayData.length

  if (loading && summary.length === 0) {
    return <div className="loading">⏳ Cargando datos...</div>
  }

  return (
    <div className="dashboard">
      {error && <div className="error">⚠️ Error: {error}</div>}

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Discrepancias Hoy</div>
          <div className="kpi-value">{todayTotal}</div>
          <div className="kpi-sublabel">{todayUnits} unidades afectadas</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Promedio Distancia</div>
          <div className="kpi-value">
            {todayData.length > 0
              ? Math.round(
                  todayData.reduce((sum, item) => sum + item.avg_distance, 0) /
                    todayData.length
                )
              : 0}
            m
          </div>
          <div className="kpi-sublabel">Metros de diferencia</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Máxima Distancia</div>
          <div className="kpi-value">
            {todayData.length > 0 ? Math.max(...todayData.map(d => d.max_distance)) : 0}m
          </div>
          <div className="kpi-sublabel">Hoy</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Registros Históricos</div>
          <div className="kpi-value">{history.length}</div>
          <div className="kpi-sublabel">Total de discrepancias</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h2>📊 Discrepancias por Día</h2>
          <DiscrepanciesChart data={summary} />
        </div>

        <div className="list-container">
          <h2>⚠️ Unidades con Problemas Hoy</h2>
          <DiscrepanciesList data={todayData} />
        </div>
      </div>

      <div className="history-container">
        <h2>📋 Historial Completo</h2>
        <div className="history-table-wrapper">
          {history.length === 0 ? (
            <p className="empty-state">No hay discrepancias registradas</p>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th>Unidad</th>
                  <th>Distancia (m)</th>
                  <th>API1 (lat, lng)</th>
                  <th>API2 (lat, lng)</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, idx) => (
                  <tr key={idx} className={item.distance_meters > 100 ? 'critical' : ''}>
                    <td className="unit-id">{item.unit_id}</td>
                    <td className="distance">
                      <span className="badge">{Math.round(item.distance_meters)}m</span>
                    </td>
                    <td className="coords">
                      {item.api1_lat.toFixed(4)}, {item.api1_lng.toFixed(4)}
                    </td>
                    <td className="coords">
                      {item.api2_lat.toFixed(4)}, {item.api2_lng.toFixed(4)}
                    </td>
                    <td className="timestamp">
                      {new Date(item.timestamp).toLocaleString('es-ES')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="legend">
        <div className="legend-item">
          <span className="color warning"></span>50-100m: Alerta
        </div>
        <div className="legend-item">
          <span className="color critical"></span>&gt;100m: Crítico
        </div>
        <div className="legend-item">
          <span className="color info"></span>Operador puede estar usando unidad incorrecta
        </div>
      </div>
    </div>
  )
}

export default Dashboard
