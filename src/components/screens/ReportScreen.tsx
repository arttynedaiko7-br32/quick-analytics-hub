import { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MobileContainer } from '@/components/layout/MobileContainer';
import { AppHeader } from '@/components/layout/AppHeader';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ReportSection, Report } from '@/types/analysis';
import { cn } from '@/lib/utils';

interface ReportScreenProps {
  report: Report;
  onBack: () => void;
  onExport: () => void;
  onUpdateSection: (sectionId: string, content: string) => void;
}

export function ReportScreen({ report, onBack, onExport, onUpdateSection }: ReportScreenProps) {
  const [openSections, setOpenSections] = useState<string[]>(report.sections.map(s => s.id));
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const toggleSection = (id: string) => {
    setOpenSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const startEditing = (section: ReportSection) => {
    setEditingSection(section.id);
    setEditContent(section.content);
  };

  const saveEdit = (sectionId: string) => {
    onUpdateSection(sectionId, editContent);
    setEditingSection(null);
  };

  const cancelEdit = () => {
    setEditingSection(null);
    setEditContent('');
  };

  return (
    <MobileContainer
      header={
        <AppHeader 
          title="AI Report" 
          showBack 
          onBack={onBack}
          rightAction={
            <div className="text-xs text-muted-foreground">
              {new Date(report.createdAt).toLocaleDateString()}
            </div>
          }
        />
      }
      footer={
        <div className="p-4">
          <Button variant="cta" size="lg" className="w-full" onClick={onExport}>
            <FileText className="w-4 h-4 mr-2" />
            Export to PDF
          </Button>
        </div>
      }
    >
      <div className="px-4 py-4 space-y-3">
        {/* Report Header */}
        <div className="card-elevated p-4 text-center fade-in">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-1">{report.title}</h2>
          <p className="text-sm text-muted-foreground">
            AI-Generated Analysis Report
          </p>
        </div>

        {/* Report Sections */}
        {report.sections.map((section, idx) => {
          const isOpen = openSections.includes(section.id);
          const isEditing = editingSection === section.id;

          return (
            <Collapsible 
              key={section.id} 
              open={isOpen} 
              onOpenChange={() => toggleSection(section.id)}
              className="slide-up"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="card-elevated overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-sm font-medium text-secondary-foreground">
                        {idx + 1}
                      </div>
                      <h3 className="font-medium text-foreground">{section.title}</h3>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 pt-0">
                    {isEditing ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[120px] text-sm"
                          autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="sm" onClick={cancelEdit}>
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                          <Button variant="default" size="sm" onClick={() => saveEdit(section.id)}>
                            <Check className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {section.content}
                        </p>
                        {section.editable && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-3"
                            onClick={() => startEditing(section)}
                          >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </div>
    </MobileContainer>
  );
}
