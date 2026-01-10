import { useEffect } from 'react';
import { MobileContainer } from '@/components/layout/MobileContainer';

interface ProcessingScreenProps {
  onComplete: () => Promise<void>;
}

export function ProcessingScreen({ onComplete }: ProcessingScreenProps) {
  useEffect(() => {
    const performAnalysis = async () => {
      try {
        await onComplete();
      } catch (error) {
        console.error('Analysis error:', error);
      }
    };

    performAnalysis();
  }, [onComplete]);

  return (
    <MobileContainer>
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        {/* Animated circles */}
        <div className="relative w-32 h-32 mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div 
            className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"
            style={{ animationDuration: '1s' }}
          />
          <div className="absolute inset-4 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">
              ...
            </span>
          </div>
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-full border-2 border-primary animate-pulse-ring" />
        </div>

        {/* Status text */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground animate-fade-in">
            Анализируем ваши данные...
          </h2>
          <p className="text-sm text-muted-foreground">
            Пожалуйста, подождите, пока мы обрабатываем информацию
          </p>
        </div>
      </div>
    </MobileContainer>
  );
}
