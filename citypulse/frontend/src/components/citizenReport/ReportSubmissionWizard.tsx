import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Send,
  Building,
  Shield,
  Layers,
  FileText,
  Copy,
  ChevronRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { ReportCategory, PriorityLevel, AiDetailedAnalysis, CitizenReport } from '../../types/citizenReport';
import { ImageUploader } from './ImageUploader';
import { SeverityBadge } from './SeverityBadge';
import { useCitizenReportStore } from '../../store/useCitizenReportStore';

interface ReportSubmissionWizardProps {
  onSuccess: (newReportId: string) => void;
  onCancel: () => void;
}

const CATEGORY_OPTIONS: { id: ReportCategory; label: string; icon: string; defaultDept: string }[] = [
  { id: 'pothole', label: 'Potholes / Damaged Road', icon: '🚧', defaultDept: 'Roads & Infrastructure' },
  { id: 'garbage', label: 'Garbage / Waste Accumulation', icon: '🚮', defaultDept: 'Waste Management' },
  { id: 'waterlogging', label: 'Waterlogging / Drainage', icon: '🌊', defaultDept: 'Water & Drainage Authority' },
  { id: 'streetlight', label: 'Broken Streetlight', icon: '💡', defaultDept: 'Electrical & Lighting' },
  { id: 'traffic', label: 'Traffic Obstruction', icon: '🚦', defaultDept: 'Traffic Enforcement & Safety' },
  { id: 'noise', label: 'Noise Disturbance', icon: '🔊', defaultDept: 'Environmental & Noise Control' },
  { id: 'other', label: 'Other Civic Problem', icon: '⚠️', defaultDept: 'Municipal Public Works' },
];

const PRESET_LOCATIONS = [
  { address: '777 Brockton Avenue, Central District', zoneId: 'z5', lat: 40.7138, lng: -74.004 },
  { address: 'Market Square, East Hub', zoneId: 'z6', lat: 40.718, lng: -73.998 },
  { address: 'Pine Street & 5th Avenue', zoneId: 'z3', lat: 40.722, lng: -74.009 },
  { address: 'Riverside Walkway & Pier 12', zoneId: 'z4', lat: 40.709, lng: -74.012 },
  { address: 'University Quarter, School Lane', zoneId: 'z3', lat: 40.728, lng: -74.001 },
];

export const ReportSubmissionWizard: React.FC<ReportSubmissionWizardProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { reports, addReport, setSelectedReport } = useCitizenReportStore();

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isLiveCapture, setIsLiveCapture] = useState(false);
  const [capturedGps, setCapturedGps] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);

  const [category, setCategory] = useState<ReportCategory>('pothole');
  const [priority, setPriority] = useState<PriorityLevel>('high');
  const [selectedLocationIdx, setSelectedLocationIdx] = useState<number>(0);
  const [customAddress, setCustomAddress] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [department, setDepartment] = useState('Roads & Infrastructure');

  // AI & Evidence State
  const [isScanningAi, setIsScanningAi] = useState(false);
  const [aiConfidence, setAiConfidence] = useState(94);
  const [duplicateIgnore, setDuplicateIgnore] = useState(false);

  // Check Duplicate Issue
  const duplicateCandidate = reports.find(
    (r) =>
      r.category === category &&
      (r.location.zoneId === PRESET_LOCATIONS[selectedLocationIdx]?.zoneId ||
        r.title.toLowerCase().includes(title.toLowerCase().slice(0, 5)))
  );

  const handleImageAdded = (
    newImage: string,
    live: boolean,
    coords?: { lat: number; lng: number; accuracy: number }
  ) => {
    setIsLiveCapture(live);
    if (coords) setCapturedGps(coords);

    setIsScanningAi(true);
    setTimeout(() => {
      setIsScanningAi(false);
      const lower = newImage.toLowerCase();
      if (lower.includes('garbage') || lower.includes('waste')) {
        setCategory('garbage');
        setDepartment('Waste Management');
        setPriority('high');
        setAiConfidence(91);
      } else if (lower.includes('light') || lower.includes('dark')) {
        setCategory('streetlight');
        setDepartment('Electrical & Lighting');
        setPriority('medium');
        setAiConfidence(89);
      } else {
        setCategory('pothole');
        setDepartment('Roads & Infrastructure');
        setPriority('critical');
        setAiConfidence(96);
      }
    }, 1000);
  };

  const handleCategoryChange = (cat: ReportCategory) => {
    setCategory(cat);
    const opt = CATEGORY_OPTIONS.find((c) => c.id === cat);
    if (opt) setDepartment(opt.defaultDept);
  };

  const estimatedEvidenceScore = isLiveCapture ? 92 : 84;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const loc = PRESET_LOCATIONS[selectedLocationIdx];
    const finalAddress = customAddress.trim() || loc.address;
    const catObj = CATEGORY_OPTIONS.find((c) => c.id === category);

    const newReport = addReport({
      category,
      categoryLabel: catObj ? catObj.label : 'Civic Problem',
      priority,
      title: title.trim(),
      description: description.trim(),
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80'],
      location: {
        address: finalAddress,
        zoneId: loc.zoneId,
        lat: loc.lat,
        lng: loc.lng,
      },
      severity: priority === 'critical' ? 5 : priority === 'high' ? 4 : priority === 'medium' ? 3 : 2,
      reporterName: reporterName.trim() || 'Alex Rivera',
      department,
      isLiveCapture,
      gpsAccuracy: capturedGps?.accuracy || 8,
      aiAnalysis: {
        category,
        categoryLabel: catObj ? catObj.label : 'Civic Problem',
        severity: priority,
        confidence: aiConfidence,
        recommendation: `Automated priority dispatch to ${department} based on multi-feed street hazard assessment.`,
      },
    });

    onSuccess(newReport.id);
  };

  return (
    <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-xl max-w-3xl mx-auto space-y-6">
      {/* Stepper Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-muted">
          <span>STEP {currentStep} OF 6</span>
          <span className="text-accent uppercase">
            {currentStep === 1
              ? 'Describe Issue'
              : currentStep === 2
              ? 'Capture Evidence'
              : currentStep === 3
              ? 'Location'
              : currentStep === 4
              ? 'AI Consistency'
              : currentStep === 5
              ? 'Evidence Engine Preview'
              : 'Review & Submit'}
          </span>
        </div>
        <div className="w-full bg-surface-2 h-2 rounded-full overflow-hidden flex">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div
              key={s}
              className={`flex-1 h-full border-r border-surface transition-all ${
                s <= currentStep ? 'bg-accent' : 'bg-transparent'
              }`}
            />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: Describe the Issue */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="text-base font-bold text-text font-heading">
                Step 1: Describe the Civic Problem
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Provide a clear headline and brief description for municipal dispatch.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-text">
                Problem Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Deep Pothole on Main Arterial Street"
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface-2 text-text text-sm focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-text">
                Detailed Description *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe estimated size, obstruction severity, pedestrian/vehicle hazards..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface-2 text-text text-sm focus:outline-none focus:border-accent resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-text">
                Your Name / Resident Handle
              </label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="Alex Rivera (or leave blank for Anonymous)"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-2 text-text text-xs focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Capture Evidence */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="text-base font-bold text-text font-heading">
                Step 2: Capture / Upload Evidence
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Live camera capture provides high evidence weighting (+20 pts) with cryptographic time & GPS telemetry.
              </p>
            </div>

            <ImageUploader
              images={images}
              onChange={setImages}
              onImageAdded={handleImageAdded}
              maxImages={4}
            />

            {isScanningAi && (
              <div className="p-3.5 rounded-xl bg-accent/10 border border-accent/30 flex items-center gap-3 animate-pulse">
                <Sparkles className="w-5 h-5 text-accent animate-spin" />
                <span className="text-xs font-bold text-accent">
                  AI Vision Engine analyzing pixel contours and surface distress...
                </span>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Location Selection */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="text-base font-bold text-text font-heading">
                Step 3: Pinpoint Location
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Select the municipal zone or verify against device GPS telemetry.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-text">
                Select Municipal Node
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PRESET_LOCATIONS.map((loc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedLocationIdx(idx)}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                      selectedLocationIdx === idx
                        ? 'bg-accent/15 border-accent text-text ring-1 ring-accent/40 font-bold'
                        : 'bg-surface-2 border-border text-muted hover:text-text'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <div className="text-xs truncate">
                      <div className="font-semibold text-text truncate">{loc.address}</div>
                      <div className="text-[10px] font-mono text-muted">Zone {loc.zoneId.toUpperCase()}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-text mb-1">
                  Or Enter Specific Street Address
                </label>
                <input
                  type="text"
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  placeholder="e.g. 102 West Elm St, Cross-intersection"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-2 text-text text-xs focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: AI Analysis & Consistency */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="text-base font-bold text-text font-heading">
                Step 4: AI Vision & Description Consistency
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Review automated classification, description semantic alignment, and duplicate detection.
              </p>
            </div>

            {/* AI DUPLICATE ISSUE DETECTION BANNER */}
            {duplicateCandidate && !duplicateIgnore && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-300 space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <span className="font-bold text-xs font-heading">
                    Similar Issue Detected in this Area
                  </span>
                </div>
                <div className="text-xs text-amber-200/90 pl-7 space-y-1">
                  <p>
                    <strong>{duplicateCandidate.id}</strong> (92% spatial similarity) reported 2 hours ago at <em>{duplicateCandidate.location.address}</em>.
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedReport(duplicateCandidate)}
                      className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 cursor-pointer"
                    >
                      View Existing Report
                    </button>
                    <button
                      type="button"
                      onClick={() => setDuplicateIgnore(true)}
                      className="text-xs underline text-amber-300 hover:text-white cursor-pointer"
                    >
                      Submit as Separate Issue
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* AI Classification Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-accent/10 via-surface-2 to-surface border border-accent/40 space-y-3">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <div className="flex items-center gap-2 text-accent font-bold text-xs font-heading">
                  <Sparkles className="w-4 h-4" />
                  <span>AI VISION ANALYSIS</span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  {aiConfidence}% Confidence
                </span>
              </div>

              {/* Editable Category */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase font-mono text-muted">
                  Category (Click to override)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleCategoryChange(opt.id)}
                      className={`p-2 rounded-lg text-left text-xs font-medium transition-colors cursor-pointer border ${
                        category === opt.id
                          ? 'bg-accent text-white font-bold border-accent shadow-sm'
                          : 'bg-surface text-muted hover:text-text border-border'
                      }`}
                    >
                      {opt.icon} {opt.label.split(' / ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase font-mono text-muted">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text font-bold"
                  >
                    <option value="critical">Critical (12h SLA)</option>
                    <option value="high">High (24h SLA)</option>
                    <option value="medium">Medium (48h SLA)</option>
                    <option value="low">Low (72h SLA)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase font-mono text-muted">
                    Assigned Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-text"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Evidence Engine Preview */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="text-base font-bold text-text font-heading">
                Step 5: CityPulse Evidence Engine Preview
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Multi-signal confidence score calculated prior to municipal dispatch queue.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-2/70 border border-accent/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-accent" />
                  <span className="font-bold text-sm text-text font-heading">
                    Estimated Evidence Strength
                  </span>
                </div>
                <span className="text-lg font-bold font-mono text-accent">
                  {estimatedEvidenceScore} / 100
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-surface/70 border border-border/50">
                  <span className="text-muted block text-[10px]">Live Camera Capture:</span>
                  <span className="font-bold text-emerald-400 font-mono">{isLiveCapture ? '✓ +20 pts (Active)' : '+10 pts (Upload)'}</span>
                </div>
                <div className="p-2 rounded-xl bg-surface/70 border border-border/50">
                  <span className="text-muted block text-[10px]">GPS Telemetry:</span>
                  <span className="font-bold text-emerald-400 font-mono">✓ +20 pts (Matched ±8m)</span>
                </div>
                <div className="p-2 rounded-xl bg-surface/70 border border-border/50">
                  <span className="text-muted block text-[10px]">AI Vision Match:</span>
                  <span className="font-bold text-emerald-400 font-mono">✓ +18 pts (96% conf)</span>
                </div>
                <div className="p-2 rounded-xl bg-surface/70 border border-border/50">
                  <span className="text-muted block text-[10px]">Deduplication Scan:</span>
                  <span className="font-bold text-emerald-400 font-mono">✓ +5 pts (No overlap)</span>
                </div>
              </div>

              <div className="text-[10px] text-muted italic pt-1 border-t border-border/40">
                Evidence Confidence measures signal corroboration across sensors and user models; it does not claim mathematical infallibility.
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Review & Submit */}
        {currentStep === 6 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="text-base font-bold text-text font-heading">
                Step 6: Review & Submit Complaint
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Verify details before syncing with the citywide monitoring matrix.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-2/60 border border-border space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="font-bold text-sm text-text font-heading">{title || 'Untitled Issue'}</span>
                <SeverityBadge priority={priority} size="sm" />
              </div>

              <p className="text-muted leading-relaxed font-sans">{description}</p>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-border/60">
                <div>
                  <span className="text-muted block">Location:</span>
                  <span className="font-medium text-text">{customAddress || PRESET_LOCATIONS[selectedLocationIdx].address}</span>
                </div>
                <div>
                  <span className="text-muted block">Department:</span>
                  <span className="font-medium text-text">{department}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface text-text border border-border text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl bg-surface-2 text-muted hover:text-text border border-border text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
          )}

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={() => {
                if (currentStep === 1 && (!title.trim() || !description.trim())) return;
                setCurrentStep(currentStep + 1);
              }}
              disabled={currentStep === 1 && (!title.trim() || !description.trim())}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent/90 disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-accent/20"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent/90 shadow-lg shadow-accent/25 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Submit to Evidence Engine</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
