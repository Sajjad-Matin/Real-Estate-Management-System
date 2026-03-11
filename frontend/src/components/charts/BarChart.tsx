import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface BarChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  title?: string;
  color?: string;
}

const BarChart = ({ data, xKey, yKey, title, color = '#3b82f6' }: BarChartProps) => {
  return (
    <div className="w-full h-full">
      {title && <h3 className="text-lg font-semibold text-primary mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis 
            dataKey={xKey} 
            className="text-xs text-secondary"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis 
            className="text-xs text-secondary"
            tick={{ fill: 'currentColor' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-primary)',
              borderRadius: '0.5rem',
              color: 'var(--text-primary)',
            }}
          />
          <Bar dataKey={yKey} fill={color} radius={[8, 8, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;