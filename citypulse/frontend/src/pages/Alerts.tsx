import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Info,
  Plus,
  Trash2,
  Check,
  X,
  Sliders,
} from 'lucide-react';
import { useCityStore } from '../store/useCityStore';
import { apiClient } from '../api/client';
import { Card } from '../components/common/Card';
import { AlertRule } from '../api/types';

export const Alerts: React.FC = () => {
  const { alerts, rules, setAlerts, setRules, acknowledgeAlert } = useCityStore();
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [newRule, setNewRule] = useState<Partial<AlertRule>>({
    name: '',
    metric: 'pulse_score',
    zone_id: null,
    operator: '<',
    threshold: 50,
    enabled: true,
    cooldown_s: 120,
  });

  const handleAcknowledge = async (id: string) => {
    try {
      await apiClient.acknowledgeAlert(id);
      acknowledgeAlert(id);
    } catch (err) {
      console.warn('Ack failed:', err);
    }
  };

  const handleToggleRule = async (rule: AlertRule) => {
    try {
      const updated = await apiClient.updateAlertRule(rule.id, { enabled: !rule.enabled });
      setRules(rules.map((r) => (r.id === rule.id ? updated : r)));
    } catch (err) {
      console.warn('Rule toggle failed:', err);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      await apiClient.deleteAlertRule(ruleId);
      setRules(rules.filter((r) => r.id !== ruleId));
    } catch (err) {
      console.warn('Rule delete failed:', err);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.name) return;
    try {
      const created = await apiClient.createAlertRule(newRule);
      setRules([...rules, created]);
      setShowRuleModal(false);
      setNewRule({
        name: '',
        metric: 'pulse_score',
        zone_id: null,
        operator: '<',
        threshold: 50,
        enabled: true,
        cooldown_s: 120,
      });
    } catch (err) {
      console.warn('Failed to create rule:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-bold text-text font-heading">
            Autonomous Agentic Monitor & Alerts
          </h2>
        </div>
        <p className="text-xs text-muted">
          Continuous background monitor evaluating civic safety rules every 5 seconds. Proactively flags anomalies and severe strain.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Alerts Feed (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text font-heading">
              Triggered Alerts ({alerts.length})
            </h3>
            <span className="text-xs text-muted font-mono">
              {alerts.filter((a) => !a.acknowledged).length} unacknowledged
            </span>
          </div>

          {alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((alt) => {
                const isCritical = alt.level === 'critical';
                const isWarning = alt.level === 'warning';
                const LevelIcon = isCritical ? Flame : isWarning ? AlertTriangle : Info;

                return (
                  <Card
                    key={alt.id}
                    className={`p-4 transition-all ${
                      !alt.acknowledged
                        ? isCritical
                          ? 'border-status-critical/60 shadow-glow-critical'
                          : 'border-accent/50'
                        : 'opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`p-1.5 rounded-lg border ${
                            isCritical
                              ? 'bg-status-critical/15 text-status-critical border-status-critical/30'
                              : isWarning
                              ? 'bg-status-watch/15 text-status-watch border-status-watch/30'
                              : 'bg-accent/15 text-accent border-accent/30'
                          }`}
                        >
                          <LevelIcon className="w-4 h-4" />
                        </span>
                        <h4 className="font-bold text-sm text-text font-heading">{alt.title}</h4>
                      </div>

                      <span className="text-[10px] text-muted font-mono">
                        {new Date(alt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-text/80 leading-relaxed font-sans mb-3 ml-8">
                      {alt.message}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                      <span className="font-mono text-[11px] text-muted">
                        Zone: {alt.zone_id ? alt.zone_id.toUpperCase() : 'All City'}
                      </span>

                      {!alt.acknowledged ? (
                        <button
                          onClick={() => handleAcknowledge(alt.id)}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-accent hover:bg-accent-hover text-white font-medium text-xs transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Acknowledge</span>
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-muted font-mono text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-status-calm" />
                          <span>Acknowledged</span>
                        </span>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-8 text-center text-xs text-muted">
              No alerts have triggered. System state is nominal.
            </Card>
          )}
        </div>

        {/* Rules Manager (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text font-heading">
              Agentic Rules Engine
            </h3>
            <button
              onClick={() => setShowRuleModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Rule</span>
            </button>
          </div>

          <div className="space-y-3">
            {rules.map((rule) => (
              <Card key={rule.id} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h5 className="font-bold text-xs text-text font-heading">{rule.name}</h5>
                    <div className="font-mono text-[11px] text-muted">
                      Condition: {rule.metric} {rule.operator} {rule.threshold}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => handleToggleRule(rule)}
                        className="sr-only peer"
                      />
                      <div className="w-7 h-4 bg-surface-2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-accent border border-border"></div>
                    </label>

                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1 rounded text-muted hover:text-status-critical transition-colors cursor-pointer"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted font-mono pt-2 border-t border-border/40">
                  <span>Target: {rule.zone_id ? rule.zone_id.toUpperCase() : 'Any Zone'}</span>
                  <span>Cooldown: {rule.cooldown_s}s</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Add Rule Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <h4 className="font-bold text-base text-text font-heading">
                Create Agentic Monitoring Rule
              </h4>
              <button
                onClick={() => setShowRuleModal(false)}
                className="p-1.5 rounded-lg bg-surface-2 text-muted hover:text-text cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted font-heading uppercase text-[10px] mb-1">
                  Rule Name
                </label>
                <input
                  type="text"
                  required
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="e.g. Critical Transit Slowdown"
                  className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-text text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-heading uppercase text-[10px] mb-1">
                    Metric
                  </label>
                  <select
                    value={newRule.metric}
                    onChange={(e) => setNewRule({ ...newRule, metric: e.target.value as any })}
                    className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-text text-xs focus:outline-none focus:border-accent"
                  >
                    <option value="pulse_score">Pulse Score</option>
                    <option value="anomaly_severity">Anomaly Severity</option>
                    <option value="feed_down">Feed Offline Seconds</option>
                  </select>
                </div>

                <div>
                  <label className="block text-muted font-heading uppercase text-[10px] mb-1">
                    Operator & Value
                  </label>
                  <div className="flex gap-1.5">
                    <select
                      value={newRule.operator}
                      onChange={(e) => setNewRule({ ...newRule, operator: e.target.value as any })}
                      className="bg-surface-2 border border-border rounded-xl px-2 py-2 text-text text-xs focus:outline-none focus:border-accent"
                    >
                      <option value="<">&lt;</option>
                      <option value=">">&gt;</option>
                    </select>
                    <input
                      type="number"
                      step="any"
                      required
                      value={newRule.threshold}
                      onChange={(e) => setNewRule({ ...newRule, threshold: parseFloat(e.target.value) })}
                      className="flex-1 bg-surface-2 border border-border rounded-xl px-3 py-2 text-text text-xs focus:outline-none focus:border-accent font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-muted font-heading uppercase text-[10px] mb-1">
                  Cooldown (Seconds)
                </label>
                <input
                  type="number"
                  value={newRule.cooldown_s}
                  onChange={(e) => setNewRule({ ...newRule, cooldown_s: parseInt(e.target.value) })}
                  className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-text text-xs focus:outline-none focus:border-accent font-mono"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-2 text-muted hover:text-text cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium cursor-pointer"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
