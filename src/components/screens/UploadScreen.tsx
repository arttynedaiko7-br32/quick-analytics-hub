import { useState, useCallback } from 'react';
import { Upload, Link2, FileSpreadsheet, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MobileContainer } from '@/components/layout/MobileContainer';
import { AppHeader } from '@/components/layout/AppHeader';
import { cn } from '@/lib/utils';

interface UploadScreenProps {
  onFileUpload: (file: File) => void;
  onGoogleSheetLink: (url: string) => void;
}

export function UploadScreen({ onFileUpload, onGoogleSheetLink }: UploadScreenProps) {
  const [dragOver, setDragOver] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv'))) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const handleSheetSubmit = () => {
    if (!sheetUrl.trim()) {
      setUrlError('Пожалуйста, введите ссылку на Google Sheets');
      return;
    }
    if (!sheetUrl.includes('docs.google.com/spreadsheets')) {
      setUrlError('Пожалуйста, введите корректную ссылку на Google Sheets');
      return;
    }
    setUrlError('');
    onGoogleSheetLink(sheetUrl);
  };

  return (
    <MobileContainer header={<AppHeader />}>
      <div className="px-4 py-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            ИИ-аналитика
          </div>
          <h1 className="text-3xl font-bold text-foreground leading-tight">
            Превратите данные в
            <span className="gradient-text block">полезные инсайты</span>
          </h1>
          <p className="text-muted-foreground text-base max-w-sm mx-auto">
            Загрузите таблицу и получите мгновенный ИИ-анализ с графиками, прогнозами и рекомендациями.
          </p>
        </div>

        {/* Upload Zone */}
        <div
          className={cn(
            "upload-zone flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200",
            dragOver && "border-primary bg-primary/5 scale-[1.02]"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Upload className="w-7 h-7 text-primary" />
          </div>
          <p className="font-semibold text-foreground mb-1">Загрузить таблицу</p>
          <p className="text-sm text-muted-foreground">
            Перетащите файл сюда или нажмите для выбора
          </p>
          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel (.xlsx, .xls) или CSV</span>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-muted-foreground font-medium">или</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Google Sheets Input */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Link2 className="w-4 h-4 text-primary" />
            Импорт из Google Sheets
          </label>
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="Вставьте ссылку на Google Sheets..."
              value={sheetUrl}
              onChange={(e) => {
                setSheetUrl(e.target.value);
                setUrlError('');
              }}
              className="flex-1"
            />
            <Button onClick={handleSheetSubmit} size="icon" className="shrink-0">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          {urlError && <p className="text-sm text-destructive">{urlError}</p>}
          <p className="text-xs text-muted-foreground">
            Убедитесь, что доступ к таблице открыт для всех по ссылке
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 pt-4">
          {[
            { icon: '📊', label: 'Авто-графики' },
            { icon: '🤖', label: 'ИИ-инсайты' },
            { icon: '📄', label: 'Экспорт PDF' },
          ].map((feature) => (
            <div key={feature.label} className="insight-card text-center py-4">
              <span className="text-2xl mb-2 block">{feature.icon}</span>
              <span className="text-xs font-medium text-muted-foreground">{feature.label}</span>
            </div>
          ))}
        </div>
      </div>
    </MobileContainer>
  );
}
