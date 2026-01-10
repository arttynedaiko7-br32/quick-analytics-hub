export interface DataSheet {
  name: string;
  rowCount: number;
  columnCount: number;
  headers: string[];
  preview: Record<string, string | number>[];
  data: Record<string, string | number>[];
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  sheets: DataSheet[];
}

export interface InsightCard {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'chart-3' | 'chart-4' | 'chart-5';
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface AnalysisResult {
  insights: InsightCard[];
  lineChartData: ChartData[];
  barChartData: ChartData[];
  pieChartData: ChartData[];
  statistics: {
    totalRows: number;
    totalColumns: number;
    numericColumns: number;
    dateColumns: number;
  };
}

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  editable: boolean;
}

export interface Report {
  id: string;
  title: string;
  createdAt: Date;
  sections: ReportSection[];
}

export type AppStep = 'upload' | 'preview' | 'processing' | 'insights' | 'charts' | 'report' | 'export';
