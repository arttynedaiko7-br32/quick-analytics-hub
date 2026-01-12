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

// --- НАЧАЛО: ИСПРАВЛЕННЫЙ БЛОК ДЛЯ КОРРЕЛЯЦИИ ---
  if (backendAnalysis.correlations) {
    const processedPairs = new Set();
    const threshold = 0.7; // Порог для сильной корреляции

    for (const col1 in backendAnalysis.correlations) {
      for (const col2 in backendAnalysis.correlations[col1]) {
        if (col1 === col2) continue;

        const pairKey = [col1, col2].sort().join('--');
        if (processedPairs.has(pairKey)) continue;

        const value = backendAnalysis.correlations[col1][col2];
        
        if (typeof value !== 'number') continue;
        
        if (Math.abs(value) >= threshold) {
          const correlationPercent = (value * 100).toFixed(0);
          let insight;

          // ИСПРАВЛЕНИЕ: Теперь 'content' формируется корректно,
          // подставляя имена колонок `col1` и `col2` в текст.
          if (value > 0) {
            insight = {
              id: `corr-${pairKey}`,
              type: 'correlation',
              title: 'Сильная положительная связь',
              value: `Показатели "${col1}" и "${col2}" сильно связаны и, как правило, движутся в одном направлении. (Корреляция: ${correlationPercent}%)`,
            };
          } else {
            insight = {
              id: `corr-${pairKey}`,
              type: 'correlation',
              title: 'Сильная обратная связь',
              value: `Показатели "${col1}" и "${col2}" имеют сильную обратную связь: когда один растет, другой имеет тенденцию к снижению. (Корреляция: ${correlationPercent}%)`,
            };
          }
          insights.push(insight);
        }
        processedPairs.add(pairKey);
      }
    }
  }
  // --- КОНЕЦ: ИСПРАВЛЕННОГО БЛОКА ---
  return insights;
}