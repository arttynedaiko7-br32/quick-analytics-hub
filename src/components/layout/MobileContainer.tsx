import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MobileContainerProps {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
}

export function MobileContainer({ children, className, header, footer }: MobileContainerProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {header && (
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50 safe-top">
          {header}
        </header>
      )}
      <main className={cn("flex-1 overflow-y-auto", className)}>
        {children}
      </main>
      {footer && (
        <footer className="sticky bottom-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border/50 safe-bottom">
          {footer}
        </footer>
      )}
    </div>
  );
}
