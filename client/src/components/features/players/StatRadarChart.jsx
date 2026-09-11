import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

export const StatRadarChart = ({ player1, player2, format = 'odi', mode = 'batting' }) => {
  if (!player1) return null;

  if (mode === 'batting') {
    const p1Stats = player1.batting_stats?.[format] || {};
    const p2Stats = player2?.batting_stats?.[format] || {};

    const chartData = [
      {
        subject: 'Average',
        [player1.name]: parseFloat(p1Stats.average) || 0,
        ...(player2 ? { [player2.name]: parseFloat(p2Stats.average) || 0 } : {}),
      },
      {
        subject: 'Strike Rate',
        [player1.name]: Math.min(parseFloat(p1Stats.strike_rate) || 0, 200) / 2, // normalized
        ...(player2 ? { [player2.name]: Math.min(parseFloat(p2Stats.strike_rate) || 0, 200) / 2 } : {}),
      },
      {
        subject: '100s',
        [player1.name]: (parseInt(p1Stats.hundreds) || 0) * 2,
        ...(player2 ? { [player2.name]: (parseInt(p2Stats.hundreds) || 0) * 2 } : {}),
      },
      {
        subject: '50s',
        [player1.name]: parseInt(p1Stats.fifties) || 0,
        ...(player2 ? { [player2.name]: parseInt(p2Stats.fifties) || 0 } : {}),
      },
      {
        subject: 'Runs (k)',
        [player1.name]: (parseFloat(p1Stats.runs) || 0) / 200,
        ...(player2 ? { [player2.name]: (parseFloat(p2Stats.runs) || 0) / 200 } : {}),
      },
    ];

    return (
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={false} />
            <Radar
              name={player1.name}
              dataKey={player1.name}
              stroke="#22c55e"
              fill="#22c55e"
              fillOpacity={0.45}
            />
            {player2 && (
              <Radar
                name={player2.name}
                dataKey={player2.name}
                stroke="#38bdf8"
                fill="#38bdf8"
                fillOpacity={0.45}
              />
            )}
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Bowling comparison bar
  const p1Bowl = player1.bowling_stats?.[format] || {};
  const p2Bowl = player2?.bowling_stats?.[format] || {};

  const barData = [
    {
      metric: 'Wickets',
      [player1.name]: parseInt(p1Bowl.wickets) || 0,
      ...(player2 ? { [player2.name]: parseInt(p2Bowl.wickets) || 0 } : {}),
    },
    {
      metric: 'Economy',
      [player1.name]: parseFloat(p1Bowl.economy) || 0,
      ...(player2 ? { [player2.name]: parseFloat(p2Bowl.economy) || 0 } : {}),
    },
    {
      metric: 'Average',
      [player1.name]: parseFloat(p1Bowl.average) || 0,
      ...(player2 ? { [player2.name]: parseFloat(p2Bowl.average) || 0 } : {}),
    },
  ];

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={barData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
          <XAxis dataKey="metric" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} 
            itemStyle={{ color: '#f8fafc' }}
          />
          <Legend />
          <Bar dataKey={player1.name} fill="#22c55e" radius={[6, 6, 0, 0]} />
          {player2 && <Bar dataKey={player2.name} fill="#38bdf8" radius={[6, 6, 0, 0]} />}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
