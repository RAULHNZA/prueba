import React from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

function DiscrepanciesChart({ data }) {
  if (!data || data.length === 0) {
    return <p style={{ textAlign: 'center', color: '#999' }}>Sin datos disponibles</p>
  }

  // Preparar datos para gráfico
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('es-ES'),
    discrepancias: item.count,
    promedio_m: Math.round(item.avg_distance),
    unidades: item.affected_units,
  }))

  return (
    <div style={{ width: '100%', height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontSize: '12px',
            }}
          />
          <Legend />
          <Bar dataKey="discrepancias" fill="#667eea" name="Discrepancias" />
          <Bar dataKey="unidades" fill="#764ba2" name="Unidades Afectadas" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default DiscrepanciesChart
