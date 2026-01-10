import { useState, useCallback } from 'react';
import { UploadScreen } from '@/components/screens/UploadScreen';
import { PreviewScreen } from '@/components/screens/PreviewScreen';
import { ProcessingScreen } from '@/components/screens/ProcessingScreen';
import { InsightsScreen } from '@/components/screens/InsightsScreen';
import { ChartsScreen } from '@/components/screens/ChartsScreen';
import { ReportScreen } from '@/components/screens/ReportScreen';
import { ExportScreen } from '@/components/screens/ExportScreen';
import { AppStep, UploadedFile, Report, AnalysisResult, InsightCard } from '@/types/analysis';
import { uploadFile, uploadGoogleSheet, analyzeData } from '@/lib/backend';

import { 
  createMockUploadedFile, 
  createMockReport 
} from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

export default function Index() {
  const [step, setStep] = useState<AppStep>('upload');
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [report, setReport] = useState<Report | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);


const handleFileUpload = useCallback(async (file: File) => {
  try {
    const result = await uploadFile(file);

    const uploadedFile: UploadedFile = {
      name: file.name,
      size: file.size,
      type: 'excel',
      sheets: (result.sheets ?? []).map((s: any) => ({
        name: s.name,
        rowCount: s.rowCount ?? s.rows ?? s.preview?.length ?? 0,
        columnCount: s.columnCount ?? s.columns ?? (s.headers ?? s.columns ?? (s.preview?.[0] ? Object.keys(s.preview[0]) : [])).length,
        headers: s.headers ?? s.columns ?? (s.preview?.[0] ? Object.keys(s.preview[0]) : []),
        preview: s.preview ?? [],
        data: s.data ?? [],
      })),
    };

    setUploadedFile(uploadedFile);
    setStep('preview');

    toast({
      title: 'File uploaded',
      description: `${file.name} loaded successfully`,
    });
  } catch (e) {
    console.error(e);
    toast({
      title: 'Upload failed',
      description: 'Could not process the file',
      variant: 'destructive',
    });
  }
}, []);



  const handleGoogleSheetLink = useCallback(async (url: string) => {
    try {
      const result = await uploadGoogleSheet(url);

      const uploadedFile: UploadedFile = {
        name: url,
        size: 0, // Google Sheets don't have a local file size
        type: 'google_sheet',
        sheets: (result.sheets ?? []).map((s: any) => {
          const headers =
            s.headers ??
            (s.preview?.[0] ? Object.keys(s.preview[0]) : []);

          return {
            name: s.name,
            rowCount: s.rowCount ?? s.rows ?? s.preview?.length ?? 0,
            columnCount: s.columnCount ?? s.columns ?? headers.length,
            headers,
            preview: s.preview ?? [],
            data: s.data ?? [],
          };
        }),
      };

      setUploadedFile(uploadedFile);
      setStep('preview');

      toast({
        title: 'Sheet imported',
        description: 'Google Sheet loaded successfully',
      });
    } catch (e) {
      console.error(e);
      toast({
        title: 'Import failed',
        description: 'Could not process the Google Sheet',
        variant: 'destructive',
      });
    }
  }, []);

  const handleStartAnalysis = useCallback((sheetName: string) => {
    setSelectedSheet(sheetName);
    setStep('processing');
  }, []);

  const handleProcessingComplete = useCallback(async () => {
    if (!uploadedFile || !selectedSheet) return;

    try {
      const sheet = uploadedFile.sheets.find(s => s.name === selectedSheet);
      if (!sheet) return;

      const data = sheet.data; // Full data for analysis
      const response = await analyzeData(data);

      // Transform backend response to AnalysisResult
      const backendAnalysis = response.analysis;
      const insights: InsightCard[] = [];

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

      // Create insights from consumption
      if (backendAnalysis.consumption) {
        Object.entries(backendAnalysis.consumption).forEach(([key, value]: [string, any], index) => {
          insights.push({
            id: `consumption-${index}`,
            title: `${key} (потребление)`,
            value: value.total.toString(),
            icon: 'bar',
            color: 'warning',
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
              value: '₽' + value.max.value + ' (период: ' + value.max.period + ')',
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
              value: '₽' + anomaly.value + ' (период: ' + anomaly.period + ')',
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

      // Mock chart data for now, or transform if possible
      const analysisResult: AnalysisResult = {
        insights,
        lineChartData: [], // No charts from analytics.py
        barChartData: [],
        pieChartData: [],
        statistics: {
          totalRows: sheet.rowCount,
          totalColumns: sheet.columnCount,
          numericColumns: Object.keys(backendAnalysis.financial || {}).length + Object.keys(backendAnalysis.metrics || {}).length + Object.keys(backendAnalysis.consumption || {}).length,
          dateColumns: backendAnalysis.meta?.period_column ? 1 : 0,
        },
      };

      setAnalysisResult(analysisResult);
      setStep('insights');
    } catch (e) {
      console.error(e);
      toast({
        title: 'Analysis failed',
        description: 'Could not analyze the data',
        variant: 'destructive',
      });
      // Do not fallback to mock, stay on processing or go back
      setStep('preview');
    }
  }, [uploadedFile, selectedSheet]);

  const handleViewCharts = useCallback(() => {
    setStep('charts');
  }, []);

  const handleGenerateReport = useCallback(() => {
    const newReport = createMockReport();
    setReport(newReport);
    setStep('report');
  }, []);

  const handleGoToReport = useCallback(() => {
    if (!report) {
      const newReport = createMockReport();
      setReport(newReport);
    }
    setStep('report');
  }, [report]);

  const handleExport = useCallback(() => {
    setStep('export');
  }, []);

  const handleUpdateReportSection = useCallback((sectionId: string, content: string) => {
    if (report) {
      setReport({
        ...report,
        sections: report.sections.map(s => 
          s.id === sectionId ? { ...s, content } : s
        ),
      });
      toast({
        title: 'Section updated',
        description: 'Your changes have been saved',
      });
    }
  }, [report]);

  const handleDownloadPdf = useCallback(() => {
    toast({
      title: 'PDF Generated',
      description: 'Your report is downloading...',
    });
    // In a real app, this would generate and download a PDF
  }, []);

  const handleStartOver = useCallback(() => {
    setStep('upload');
    setUploadedFile(null);
    setSelectedSheet('');
    setReport(null);
  }, []);

  const goBack = useCallback(() => {
    const stepOrder: AppStep[] = ['upload', 'preview', 'processing', 'insights', 'charts', 'report', 'export'];
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex > 0) {
      // Skip processing when going back
      if (step === 'insights') {
        setStep('preview');
      } else {
        setStep(stepOrder[currentIndex - 1]);
      }
    }
  }, [step]);

  return (
    <>
      {step === 'upload' && (
        <UploadScreen 
          onFileUpload={handleFileUpload}
          onGoogleSheetLink={handleGoogleSheetLink}
        />
      )}

      {step === 'preview' && uploadedFile && (
        <PreviewScreen
          file={uploadedFile}
          onBack={() => setStep('upload')}
          onStartAnalysis={handleStartAnalysis}
        />
      )}

      {step === 'processing' && (
        <ProcessingScreen onComplete={handleProcessingComplete} />
      )}

      {step === 'insights' && (
        <InsightsScreen
          insights={analysisResult?.insights || []}
          onBack={goBack}
          onViewCharts={handleViewCharts}
          onGenerateReport={handleGenerateReport}
        />
      )}

      {step === 'charts' && (
        <ChartsScreen
          lineData={analysisResult?.lineChartData || []}
          barData={analysisResult?.barChartData || []}
          pieData={analysisResult?.pieChartData || []}
          onBack={() => setStep('insights')}
          onGoToReport={handleGoToReport}
        />
      )}

      {step === 'report' && report && (
        <ReportScreen
          report={report}
          onBack={() => setStep('insights')}
          onExport={handleExport}
          onUpdateSection={handleUpdateReportSection}
        />
      )}

      {step === 'export' && report && (
        <ExportScreen
          reportId={report.id}
          onBack={() => setStep('report')}
          onDownloadPdf={handleDownloadPdf}
          onStartOver={handleStartOver}
        />
      )}
    </>
  );
}
