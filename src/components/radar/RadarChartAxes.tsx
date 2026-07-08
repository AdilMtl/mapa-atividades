'use client'

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts'

interface Axis {
  id: string
  label: string
  valor: number
}

interface RadarChartAxesProps {
  eixos: Axis[]
  max: number
}

export function RadarChartAxes({ eixos, max }: RadarChartAxesProps) {
  const data = eixos.map((eixo) => ({ eixo: eixo.label, valor: eixo.valor }))

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="rgba(255,255,255,0.14)" />
          <PolarAngleAxis
            dataKey="eixo"
            tick={{ fill: '#D2DDD9', fontSize: 11 }}
          />
          <PolarRadiusAxis domain={[0, max]} tick={false} axisLine={false} />
          <Radar dataKey="valor" stroke="#D97706" fill="#D97706" fillOpacity={0.28} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
