import { useState } from 'react';
import { Download, Link2, Check, Share2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MobileContainer } from '@/components/layout/MobileContainer';
import { AppHeader } from '@/components/layout/AppHeader';
import { cn } from '@/lib/utils';

interface ExportScreenProps {
  reportId: string;
  onBack: () => void;
  onDownloadPdf: () => void;
  onStartOver: () => void;
}

export function ExportScreen({ reportId, onBack, onDownloadPdf, onStartOver }: ExportScreenProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/report/${reportId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Аналитический отчёт',
          text: 'Посмотрите этот аналитический отчёт',
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <MobileContainer header={<AppHeader title="Экспорт и отправка" showBack onBack={onBack} />}>
      <div className="px-4 py-6 space-y-6">
        {/* Success Header */}
        <div className="text-center py-6 fade-in">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Отчёт готов!</h2>
          <p className="text-muted-foreground">
            Ваш анализ завершён. Скачайте или поделитесь отчётом.
          </p>
        </div>

        {/* Download Section */}
        <div className="card-elevated p-5 space-y-4 slide-up">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Скачать PDF</h3>
              <p className="text-sm text-muted-foreground">Получите отформатированный документ</p>
            </div>
          </div>
          <Button variant="cta" size="lg" className="w-full" onClick={onDownloadPdf}>
            <Download className="w-4 h-4 mr-2" />
            Скачать PDF
          </Button>
        </div>

        {/* Share Section */}
        <div className="card-elevated p-5 space-y-4 slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-chart-5/10 flex items-center justify-center">
              <Share2 className="w-6 h-6 text-chart-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Поделиться отчётом</h3>
              <p className="text-sm text-muted-foreground">Отправьте ссылку для просмотра</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="flex-1 text-sm bg-muted"
            />
            <Button 
              variant={copied ? "success" : "outline"} 
              size="icon" 
              onClick={handleCopyLink}
              className="shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
            </Button>
          </div>

          {navigator.share && (
            <Button variant="outline" size="lg" className="w-full" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Поделиться
            </Button>
          )}
        </div>

        {/* Start Over */}
        <div className="pt-4">
          <Button variant="ghost" size="lg" className="w-full" onClick={onStartOver}>
            Анализировать другой набор данных
          </Button>
        </div>
      </div>
    </MobileContainer>
  );
}
