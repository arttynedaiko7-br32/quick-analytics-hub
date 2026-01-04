import { ChevronLeft, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
}

export function AppHeader({ title, showBack, onBack, rightAction, className }: AppHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between px-4 py-3", className)}>
      <div className="flex items-center gap-3">
        {showBack ? (
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">DataLens</span>
          </div>
        )}
        {title && <h1 className="text-lg font-semibold text-foreground">{title}</h1>}
      </div>
      {rightAction && <div>{rightAction}</div>}
    </div>
  );
}
