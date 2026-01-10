import { InsightCard } from '@/types/analysis';

export function generateInsights(backendAnalysis: any): InsightCard[] {
  const insights: InsightCard[] = [];

  // Create insights from consumption
  if (backendAnalysis.consumption) {
    Object.entries(backendAnalysis.consumption).forEach(([key, value]: [string, any], index) => {
      insights.push({
        id: `consumption-${index}`,
        title: `${key} (потребление)`,
        value: `Общее: ${value.total}, Средний рост: ${value.average_growth}`,
        icon: 'bar',
        color: 'warning',
      });
    });
  }

  // Create insights from financial metrics
  if (backendAnalysis.financial) {
    Object.entries(backendAnalysis.financial).forEach(([key, value]: [string, any], index) => {
      insights.push({
        id: `financial-${index}`,
        title: key,
        value: `Общая: ₽${value.total.toLocaleString()}, Средняя: ₽${value.average}`,
        icon: 'trending',
        color: 'primary',
      });
    });
  }

  // Create insights from extremes
  if (backendAnalysis.extremes) {
    Object.entries(backendAnalysis.extremes).forEach(([key, value]: [string, any], index) => {
      if (value.max) {
        insights.push({
          id: `extreme-${index}`,
          title: `${key} (максимум)`,
          value: `₽${value.max.value} (период: ${value.max.period})`,
          icon: 'trending-up',
          color: 'success',
        });
      }
    });
  }

  // Create insights from trends
  if (backendAnalysis.trends) {
    Object.entries(backendAnalysis.trends).forEach(([key, value]: [string, any], index) => {
      insights.push({
        id: `trend-${index}`,
        title: `${key} (тренд)`,
        value: value === 'growing' ? 'Растущий' : 'Падающий',
        icon: value === 'growing' ? 'trending-up' : 'trending-down',
        color: value === 'growing' ? 'success' : 'warning',
      });
    });
  }

  // Create insights from anomalies
  if (backendAnalysis.anomalies) {
    Object.entries(backendAnalysis.anomalies).forEach(([key, anomalies]: [string, any[]], index) => {
      anomalies.forEach((anomaly, aIndex) => {
        insights.push({
          id: `anomaly-${index}-${aIndex}`,
          title: `${key} (аномалия)`,
          value: `₽${anomaly.value} (период: ${anomaly.period})`,
          icon: 'alert-triangle',
          color: 'warning',
        });
      });
    });
  }

  // Create insights from totals
  if (backendAnalysis.totals?.by_currency) {
    Object.entries(backendAnalysis.totals.by_currency).forEach(([currency, amount]: [string, number], index) => {
      insights.push({
        id: `total-${index}`,
        title: `Общая сумма (${currency})`,
        value: `₽${amount.toLocaleString()}`,
        icon: 'dollar-sign',
        color: 'chart-4',
      });
    });
  }

  // Create insights from metrics (if any)
  if (backendAnalysis.metrics) {
    Object.entries(backendAnalysis.metrics).forEach(([key, value]: [string, any], index) => {
      insights.push({
        id: `metric-${index}`,
        title: key,
        value: value.total.toString(),
        icon: 'bar',
        color: 'chart-3',
      });
    });
  }

  return insights;
}