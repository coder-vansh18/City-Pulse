import React from 'react';
import { Sparkles, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { AiDetectionResult, ReportCategory } from '../../types/citizenReport';

interface AiAnalysisCardProps {
  isAnalyzing: boolean;
  result: AiDetectionResult | null;
  selectedCategory: ReportCategory;
  onApplyCategory: (category: ReportCategory) => void;
}

export const AiAnalysisCard: React.FC<AiAnalysisCardProps> = ({
  isAnalyzing,
  result,
  selectedCategory,
  onApplyCategory,
}) => {
  if (isAnalyzing) {
    return (
      <div className="p-4 rounded-xl border border-accent/30 bg-accent/5 flex items-center gap-3 animate-pulse">
        <div className="p-2 rounded-lg bg-accent/20 text-accent">
          <RefreshCw className="w-5 h-5 animate-spin" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">
              [Demo AI Vision Analysis]
            </span>
          </div>
          <p className="text-sm font-medium text-text mt-0.5">Analyzing photo features...</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const isMatched = selectedCategory === result.suggestedCategory;

  return (
    <div className="p-4 rounded-xl border border-accent/40 bg-gradient-to-r from-accent/10 via-surface-2 to-surface border shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-xs font-bold text-accent tracking-wide uppercase">
            Demo AI Vision Assistant
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/20 text-accent font-mono">
            Hackathon Demo
          </span>
        </div>
        <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
          {result.confidence}% Confidence
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-muted block text-[11px]">Possible issue detected:</span>
          <span className="font-semibold text-text text-sm">{result.detectedIssue}</span>
        </div>
        <div>
          <span className="text-muted block text-[11px]">Suggested Category:</span>
          <span className="font-semibold text-accent text-sm">{result.categoryLabel}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 text-xs">
        {isMatched ? (
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <Check className="w-4 h-4" />
            <span>Category confirmed</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onApplyCategory(result.suggestedCategory)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors font-medium cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Detected Category</span>
          </button>
        )}
        <span className="text-[10px] text-muted italic">
          You can confirm or change category below
        </span>
      </div>
    </div>
  );
};
