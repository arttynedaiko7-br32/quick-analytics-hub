import { useEffect, useState } from 'react';
import { MobileContainer } from '@/components/layout/MobileContainer';
import { cn } from '@/lib/utils';

interface ProcessingScreenProps {
  onComplete: () => void;
}

const processingSteps = [
  { id: 1, text: 'Читаем ваши данные...', duration: 800 },
  { id: 2, text: 'Анализируем паттерны...', duration: 1200 },
  { id: 3, text: 'Ищем тренды...', duration: 1000 },
  { id: 4, text: 'Вычисляем статистику...', duration: 800 },
  { id: 5, text: 'Генерируем инсайты...', duration: 1200 },
];

export function ProcessingScreen({ onComplete }: ProcessingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let stepIndex = 0;
    let totalDuration = processingSteps.reduce((acc, step) => acc + step.duration, 0);
    let elapsed = 0;

    const updateProgress = () => {
      const step = processingSteps[stepIndex];
      if (!step) {
        onComplete();
        return;
      }

      setCurrentStep(stepIndex);
      
      const stepInterval = setInterval(() => {
        elapsed += 50;
        setProgress((elapsed / totalDuration) * 100);
      }, 50);

      setTimeout(() => {
        clearInterval(stepInterval);
        stepIndex++;
        if (stepIndex < processingSteps.length) {
          updateProgress();
        } else {
          setProgress(100);
          setTimeout(onComplete, 300);
        }
      }, step.duration);
    };

    updateProgress();
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
              {Math.round(progress)}%
            </span>
          </div>
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-full border-2 border-primary animate-pulse-ring" />
        </div>

        {/* Status text */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground animate-fade-in">
            {processingSteps[currentStep]?.text || 'Завершаем...'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Пожалуйста, подождите, пока мы анализируем ваши данные
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs mt-8">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {processingSteps.map((step, idx) => (
            <div
              key={step.id}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                idx <= currentStep ? "bg-primary scale-100" : "bg-muted scale-75"
              )}
            />
          ))}
        </div>
      </div>
    </MobileContainer>
  );
}
