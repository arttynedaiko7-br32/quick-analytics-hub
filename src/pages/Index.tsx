import { useState, useCallback } from 'react';
import { UploadScreen } from '@/components/screens/UploadScreen';
import { PreviewScreen } from '@/components/screens/PreviewScreen';
import { ProcessingScreen } from '@/components/screens/ProcessingScreen';
import { InsightsScreen } from '@/components/screens/InsightsScreen';
import { ChartsScreen } from '@/components/screens/ChartsScreen';
import { ReportScreen } from '@/components/screens/ReportScreen';
import { ExportScreen } from '@/components/screens/ExportScreen';
import { AppStep, UploadedFile, Report } from '@/types/analysis';
import { 
  createMockUploadedFile, 
  mockInsights, 
  mockLineData, 
  mockBarData, 
  mockPieData,
  createMockReport 
} from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

export default function Index() {
  const [step, setStep] = useState<AppStep>('upload');
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [report, setReport] = useState<Report | null>(null);

  const handleFileUpload = useCallback((file: File) => {
    // In a real app, this would parse the file
    const mockFile = createMockUploadedFile(file.name);
    setUploadedFile(mockFile);
    setStep('preview');
    toast({
      title: 'File uploaded',
      description: `${file.name} loaded successfully`,
    });
  }, []);

  const handleGoogleSheetLink = useCallback((url: string) => {
    // In a real app, this would fetch the sheet
    const mockFile = createMockUploadedFile('Google Sheet Import');
    setUploadedFile(mockFile);
    setStep('preview');
    toast({
      title: 'Sheet imported',
      description: 'Google Sheet loaded successfully',
    });
  }, []);

  const handleStartAnalysis = useCallback((sheetName: string) => {
    setSelectedSheet(sheetName);
    setStep('processing');
  }, []);

  const handleProcessingComplete = useCallback(() => {
    setStep('insights');
  }, []);

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
          insights={mockInsights}
          onBack={goBack}
          onViewCharts={handleViewCharts}
          onGenerateReport={handleGenerateReport}
        />
      )}

      {step === 'charts' && (
        <ChartsScreen
          lineData={mockLineData}
          barData={mockBarData}
          pieData={mockPieData}
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
