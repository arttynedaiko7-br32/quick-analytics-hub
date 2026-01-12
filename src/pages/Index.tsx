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

import { generateInsights } from '@/utils/generateInsights';
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
      const insights = generateInsights(backendAnalysis);

      // Mock chart data for now, or transform if possible
      const analysisResult: AnalysisResult = {
        insights,
        lineChartData: backendAnalysis.charts?.line || [],
        barChartData: backendAnalysis.charts?.bar || [],
        pieChartData: backendAnalysis.charts?.pie || [],
       // correlationData: backendAnalysis.correlations || null,
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
