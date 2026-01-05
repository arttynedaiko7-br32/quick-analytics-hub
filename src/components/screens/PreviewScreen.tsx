import { useState } from 'react';
import { FileSpreadsheet, Table, Rows3, Columns3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileContainer } from '@/components/layout/MobileContainer';
import { AppHeader } from '@/components/layout/AppHeader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UploadedFile } from '@/types/analysis';

interface PreviewScreenProps {
  file: UploadedFile;
  onBack: () => void;
  onStartAnalysis: (sheetName: string) => void;
}

export function PreviewScreen({
  file,
  onBack,
  onStartAnalysis,
}: PreviewScreenProps) {
  const sheets = file.sheets ?? [];

  const [selectedSheet, setSelectedSheet] = useState<string>(
    sheets[0]?.name || ''
  );

  const currentSheet =
    sheets.find(s => s.name === selectedSheet) || sheets[0];

  const headers = currentSheet?.headers ?? [];
  const preview = currentSheet?.preview ?? [];
  const rowCount = currentSheet?.rowCount ?? 0;
  const columnCount = currentSheet?.columnCount ?? headers.length;

  if (!currentSheet) {
    return (
      <MobileContainer
        header={<AppHeader title="Предпросмотр данных" showBack onBack={onBack} />}
      >
        <div className="p-4 text-sm text-muted-foreground">
          Нет данных для предпросмотра
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer
      header={<AppHeader title="Предпросмотр данных" showBack onBack={onBack} />}
      footer={
        <div className="p-4">
          <Button
            variant="cta"
            size="lg"
            className="w-full"
            onClick={() => onStartAnalysis(selectedSheet)}
          >
            Начать анализ
          </Button>
        </div>
      }
    >
      <div className="px-4 py-4 space-y-4">
        {/* File Info */}
        <div className="card-elevated p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{file.name}</h3>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024).toFixed(1)} КБ
              </p>
            </div>
          </div>

          {/* Sheet selector */}
          {sheets.length > 1 && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Table className="w-4 h-4" />
                Выберите лист
              </label>
              <Select
                value={selectedSheet}
                onValueChange={setSelectedSheet}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите лист" />
                </SelectTrigger>
                <SelectContent>
                  {sheets.map(sheet => (
                    <SelectItem key={sheet.name} value={sheet.name}>
                      <div className="flex justify-between gap-4">
                        <span>{sheet.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {sheet.rowCount} строк
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary">
              <Rows3 className="w-4 h-4 text-primary" />
              <div>
                <p className="text-lg font-semibold">{rowCount}</p>
                <p className="text-xs text-muted-foreground">Строк</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary">
              <Columns3 className="w-4 h-4 text-primary" />
              <div>
                <p className="text-lg font-semibold">{columnCount}</p>
                <p className="text-xs text-muted-foreground">Столбцов</p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Preview */}
        <div className="card-elevated overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30">
            <h4 className="font-medium">Предпросмотр данных</h4>
            <p className="text-xs text-muted-foreground">
              Первые {preview.length} строк
            </p>
          </div>

          <ScrollArea className="h-[300px]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    {headers.map((header, i) => (
                      <th
                        key={i}
                        className="px-3 py-2 text-left font-medium whitespace-nowrap"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className="border-b hover:bg-muted/20"
                    >
                      {headers.map((header, colIdx) => (
                        <td
                          key={colIdx}
                          className="px-3 py-2 text-muted-foreground whitespace-nowrap"
                        >
                          {String(row?.[header] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </div>
      </div>
    </MobileContainer>
  );
}
