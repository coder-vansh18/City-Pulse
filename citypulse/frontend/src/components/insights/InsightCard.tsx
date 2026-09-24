import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CloudRain,
  Bus,
  Siren,
  Wind,
  Zap,
  Volume2,
  MapPin,
  Map,
  Clock,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { Insight, FeedType } from '../../api/types';
import { Card } from '../common/Card';
import { ConfidenceChip } from './ConfidenceChip';
import { CaveatNote } from './CaveatNote';
import { EvidenceList } from './EvidenceList';
import { useCityStore } from '../../store/useCityStore';

const FEED_ICONS: Record<FeedType, React.ElementType> = {
  weather: CloudRain,
  transit: Bus,
  incident: Siren,
  air_quality: Wind,
  power: Zap,
  noise: Volume2,
};

interface InsightCardProps {
  insight: Insight;
  className?: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight, className }) => {
  const navigate = useNavigate();
  const { setHighlightedInsightId, setSelectedZoneId } = useCityStore();

  const handleShowOnMap = () => {
    setHighlightedInsightId(insight.id);
    if (insight.zone_ids && insight.zone_ids.length > 0) {
      setSelectedZoneId(insight.zone_ids[0]);
    }
    navigate('/map');
  };

  const isCorrelation = insight.kind === 'correlation';

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-200 hover:border-accent/50 ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1 ${
              isCorrelation
                ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            }`}
          >
            {isCorrelation ? <Sparkles className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
            {isCorrelation ? 'Cross-Feed Link' : 'Feed Anomaly'}
          </span>
          <ConfidenceChip confidence={insight.confidence} />
        </div>

        {/* Feed Icons */}
        <div className="flex items-center gap-1 bg-surface-2 px-2 py-1 rounded-lg border border-border">
          {insight.feed_types.map((f) => {
            const Icon = FEED_ICONS[f] || Sparkles;
            return <Icon key={f} className="w-3.5 h-3.5 text-accent" title={f} />;
          })}
        </div>
      </div>

      <h4 className="text-base font-bold text-text font-heading mb-1.5 leading-snug">
        {insight.title}
      </h4>

      <p className="text-sm text-text/80 leading-relaxed font-sans mb-3">
        {insight.plain_text}
      </p>

      {/* Epistemic Honesty Caveat */}
      <CaveatNote message={insight.caveat} className="mb-3" />

      {/* Evidence */}
      <EvidenceList evidence={insight.evidence} />

      {/* Footer Info & Action */}
      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-muted" />
            <span className="font-mono text-[11px]">{insight.zone_ids.join(', ').toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-muted" />
            <span className="text-[11px]">
              {new Date(insight.window_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        <button
          onClick={handleShowOnMap}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-2 hover:bg-surface-2/80 text-accent hover:text-accent-hover font-medium border border-border/60 transition-colors cursor-pointer text-xs"
        >
          <Map className="w-3 h-3" />
          <span>Show on map</span>
        </button>
      </div>
    </Card>
  );
};
