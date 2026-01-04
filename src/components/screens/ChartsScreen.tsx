import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { MobileContainer } from '@/components/layout/MobileContainer';
import { AppHeader } from '@/components/layout/AppHeader';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartData } from '@/types/analysis';
import { cn } from '@/lib/utils';

interface ChartsScreenProps {
  lineData: ChartData[];
  barData: ChartData[];
  pieData: ChartData[];
  onBack: () => void;
  onGoToReport: () => void;
}

const CHART_COLORS = [
  'hsl(173, 58%, 39%)',  // primary
  'hsl(38, 92%, 50%)',   // cta
  'hsl(262, 52%, 55%)',  // chart-3
  'hsl(339, 76%, 59%)',  // chart-4
  'hsl(199, 89%, 48%)',  // chart-5
];

export function ChartsScreen({ lineData, barData, pieData, onBack, onGoToReport }: ChartsScreenProps) {
  const [activeChart, setActiveChart] = useState<'line' | 'bar' | 'pie'>('line');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
          <p className="text-xs font-medium text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs text-muted-foreground">
              {entry.name}: <span className="font-medium text-foreground">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <MobileContainer
      header={<AppHeader title="Визуализация данных" showBack onBack={onBack} />}
      footer={
        <div className="p-4">
          <Button variant="cta" size="lg" className="w-full" onClick={onGoToReport}>
            Перейти к отчёту
          </Button>
        </div>
      }
    >
      <div className="px-4 py-4 space-y-4">
        {/* Chart Type Selector */}
        <Tabs value={activeChart} onValueChange={(v) => setActiveChart(v as typeof activeChart)} className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-11">
            <TabsTrigger value="line" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Линия
            </TabsTrigger>
            <TabsTrigger value="bar" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Столбцы
            </TabsTrigger>
            <TabsTrigger value="pie" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Круговая
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Chart Container */}
        <div className="card-elevated p-4 fade-in">
          <div className="h-[300px] w-full">
            {activeChart === 'line' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: 'hsl(215, 16%, 47%)' }}
                    axisLine={{ stroke: 'hsl(214, 20%, 90%)' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: 'hsl(215, 16%, 47%)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={CHART_COLORS[0]} 
                    strokeWidth={2.5}
                    dot={{ fill: CHART_COLORS[0], strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: CHART_COLORS[0] }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}

            {activeChart === 'bar' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: 'hsl(215, 16%, 47%)' }}
                    axisLine={{ stroke: 'hsl(214, 20%, 90%)' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: 'hsl(215, 16%, 47%)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="value" 
                    fill={CHART_COLORS[0]} 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeChart === 'pie' && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Legend */}
        {activeChart === 'pie' && (
          <div className="card-elevated p-3">
            <div className="flex flex-wrap gap-3 justify-center">
              {pieData.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                  />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="insight-card text-center">
            <p className="text-2xl font-bold text-primary">
              {activeChart === 'line' ? lineData.length : 
               activeChart === 'bar' ? barData.length : pieData.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Точек данных</p>
          </div>
          <div className="insight-card text-center">
            <p className="text-2xl font-bold text-primary">
              {Math.round(
                (activeChart === 'line' ? lineData : 
                 activeChart === 'bar' ? barData : pieData
                ).reduce((acc, item) => acc + item.value, 0) / 
                (activeChart === 'line' ? lineData.length : 
                 activeChart === 'bar' ? barData.length : pieData.length)
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Среднее значение</p>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}
