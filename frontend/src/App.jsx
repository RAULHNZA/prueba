import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import DateRangeSelector from './components/DateRangeSelector'
import KPICards from './components/KPICards'
import ChartsGrid from './components/ChartsGrid'
import DiscrepanciesTable from './components/DiscrepanciesTable'
import './App.css'

function App() {
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date()
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(today.getDate() - 7)
    return {
      startDate: sevenDaysAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      preset: '7days',
    }
  })

  const [data, setData] = useState({
    kpis: {},
    summary: [],
    topUnits: [],
    severity: [],
    byOperator: [],
    byRoute: [],
    byHour: [],
    discrepancies: [],
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchAllData()
  }, [dateRange])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const params = `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`

      const [kpis, summary, topUnits, severity, byOperator, byRoute, byHour, discrepancies] =
        await Promise.all([
          fetch(`/api/kpis${params}`).then((r) => r.json()),
          fetch(`/api/summary${params}`).then((r) => r.json()),
          fetch(`/api/top-units${params}&limit=10`).then((r) => r.json()),
          fetch(`/api/severity-distribution${params}`).then((r) => r.json()),
          fetch(`/api/by-operator${params}`).then((r) => r.json()),
          fetch(`/api/by-route${params}`).then((r) => r.json()),
          fetch(`/api/by-hour${params}`).then((r) => r.json()),
          fetch(`/api/discrepancies${params}&limit=100`).then((r) => r.json()),
        ])

      setData({ kpis, summary, topUnits, severity, byOperator, byRoute, byHour, discrepancies })
    } catch (err) {
      console.error('Error cargando datos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await fetch('/api/sync')
      await fetchAllData()
    } finally {
      setTimeout(() => setRefreshing(false), 800)
    }
  }

  const handleRegenerate = async () => {
    if (window.confirm('¿Regenerar todos los datos históricos? Esto reemplazará los datos actuales.')) {
      setLoading(true)
      try {
        await fetch('/api/seed-data', { method: 'POST' })
        await fetchAllData()
      } catch (err) {
        alert('Error: ' + err.message)
      }
    }
  }

  return (
    <div className="app">
      <div className="background-effects">
        <div className="orb orb-green"></div>
        <div className="orb orb-blue"></div>
        <div className="orb orb-purple"></div>
      </div>

      <div className="container">
        <Header onRefresh={handleRefresh} onRegenerate={handleRegenerate} refreshing={refreshing} />

        <DateRangeSelector dateRange={dateRange} onChange={setDateRange} />

        {loading ? (
          <div className="loading-state">
            <div className="loader"></div>
            <p>Cargando información...</p>
          </div>
        ) : (
          <>
            <KPICards kpis={data.kpis} />
            <ChartsGrid data={data} dateRange={dateRange} />
            <DiscrepanciesTable
              data={data.discrepancies}
              dateRange={dateRange}
              onFilterChange={() => fetchAllData()}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default App
