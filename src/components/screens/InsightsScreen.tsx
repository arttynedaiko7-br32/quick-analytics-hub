import { TrendingUp, TrendingDown, BarChart3, PieChart, LineChart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileContainer } from '@/components/layout/MobileContainer';
import { AppHeader } from '@/components/layout/AppHeader';
import { InsightCard } from '@/types/analysis';
import { cn } from '@/lib/utils';

interface InsightsScreenProps {
  insights: InsightCard[];
  onBack: () => void;
  onViewCharts: () => void;
  onGenerateReport: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  trending: TrendingUp,
  bar: BarChart3,
  pie: PieChart,
  line: LineChart,
};

const colorMap: Record<string, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  'chart-3': 'bg-chart-3/10 text-chart-3',
  'chart-4': 'bg-chart-4/10 text-chart-4',
  'chart-5': 'bg-chart-5/10 text-chart-5',
};

export function InsightsScreen({ insights, onBack, onViewCharts, onGenerateReport }: InsightsScreenProps) {
  return (
    <MobileContainer
      header={<AppHeader title="Ключевые инсайты" showBack onBack={onBack} />}
      footer={
        <div className="p-4 space-y-2">
          <Button variant="cta" size="lg" className="w-full" onClick={onGenerateReport}>
            Сгенерировать отчёт
          </Button>
          <Button variant="outline" size="lg" className="w-full" onClick={onViewCharts}>
            Посмотреть графики
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      }
    >
      <div className="px-4 py-4 space-y-4">
        {/* Summary Header */}
        <div className="text-center py-4 fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <BarChart3 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">Анализ завершён</h2>
          <p className="text-sm text-muted-foreground">
            Мы нашли {insights.length} ключевых инсайтов в ваших данных
          </p>
        </div>

        {/* Insight Cards */}
        <div className="space-y-3">
          {insights.map((insight, idx) => {
            const Icon = iconMap[insight.icon] || TrendingUp;
            const isPositive = (insight.change ?? 0) >= 0;
            
            return (
              <div 
                key={insight.id} 
                className="insight-card slide-up"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    colorMap[insight.color] || colorMap.primary
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground mb-0.5">{insight.title}</h3>
                    <p className="text-2xl font-bold text-foreground">{insight.value}</p>
                    {insight.change !== undefined && (
                      <div className="flex items-center gap-1 mt-1">
                        {isPositive ? (
                          <TrendingUp className="w-3 h-3 text-success" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-destructive" />
                        )}
                        <span className={cn(
                          "text-xs font-medium",
                          isPositive ? "text-success" : "text-destructive"
                        )}>
                          {isPositive ? '+' : ''}{insight.change}%
                        </span>
                        {insight.changeLabel && (
                          <span className="text-xs text-muted-foreground">
                            {insight.changeLabel}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Explanation */}
        <div className="card-elevated p-4 bg-secondary/30 scale-in">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <span className="text-sm">🤖</span>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Резюме ИИ</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ваши данные демонстрируют сильные показатели с устойчивыми трендами роста. 
                Топовая категория составляет большую часть результатов, что говорит 
                о том, что сфокусированная стратегия работает хорошо. Ознакомьтесь с рекомендациями 
                в полном отчёте для поиска возможностей оптимизации.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}
