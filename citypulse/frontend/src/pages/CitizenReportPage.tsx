import React, { useState } from 'react';
import {
  PlusCircle,
  ListFilter,
  CheckCircle2,
  Sparkles,
  MapPin,
  Send,
  Search,
  Filter,
  ShieldCheck,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useCitizenReportStore } from '../store/useCitizenReportStore';
import { ReportCategory, ReportStatus, AiDetectionResult } from '../types/citizenReport';
import { ImageUploader } from '../components/citizenReport/ImageUploader';
import { AiAnalysisCard } from '../components/citizenReport/AiAnalysisCard';
import { ReportCard } from '../components/citizenReport/ReportCard';
import { ReportDetailModal } from '../components/citizenReport/ReportDetailModal';
import { Card } from '../components/common/Card';

const CATEGORY_OPTIONS: { id: ReportCategory; label: string; icon: string }[] = [
  { id: 'pothole', label: 'Potholes / Damaged Road', icon: '🚧' },
  { id: 'garbage', label: 'Garbage / Waste Accumulation', icon: '🚮' },
  { id: 'waterlogging', label: 'Waterlogging / Drainage', icon: '🌊' },
  { id: 'streetlight', label: 'Broken Streetlight', icon: '💡' },
  { id: 'traffic', label: 'Traffic Obstruction', icon: '🚦' },
  { id: 'noise', label: 'Noise Disturbance', icon: '🔊' },
  { id: 'other', label: 'Other Civic Problem', icon: '⚠️' },
];

const PRESET_LOCATIONS = [
  { address: '777 Brockton Avenue, Central District', zoneId: 'z1', lat: 12.9716, lng: 77.5946 },
  { address: 'Market Square, East Hub', zoneId: 'z2', lat: 12.978, lng: 77.601 },
  { address: 'Pine Street & 5th Avenue', zoneId: 'z3', lat: 12.965, lng: 77.585 },
  { address: 'Industrial Belt Way, Sector 4', zoneId: 'z4', lat: 12.985, lng: 77.61 },
  { address: 'Custom Coordinate Entry', zoneId: 'z1', lat: 12.97, lng: 77.59 },
];

// Simulated AI Image classifier based on image uploaded
const simulateAiAnalysis = (base64OrUrl: string): AiDetectionResult => {
  const lowercase = base64OrUrl.toLowerCase();
  if (lowercase.includes('garbage') || lowercase.includes('waste')) {
    return {
      isDemo: true,
      detectedIssue: 'Waste Accumulation & Plastic Litter',
      confidence: 91,
      suggestedCategory: 'garbage',
      categoryLabel: 'Garbage / Waste Accumulation',
    };
  } else if (lowercase.includes('light') || lowercase.includes('dark')) {
    return {
      isDemo: true,
      detectedIssue: 'Unlit Lamp Post / Electrical Fixture',
      confidence: 86,
      suggestedCategory: 'streetlight',
      categoryLabel: 'Broken Streetlight',
    };
  } else {
    return {
      isDemo: true,
      detectedIssue: 'Pothole & Surface Damage Detected',
      confidence: 94,
      suggestedCategory: 'pothole',
      categoryLabel: 'Potholes / Damaged Road',
    };
  }
};

export const CitizenReportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'feed'>('feed');

  // Form State
  const [images, setImages] = useState<string[]>([]);
  const [category, setCategory] = useState<ReportCategory>('pothole');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLocationIdx, setSelectedLocationIdx] = useState<number>(0);
  const [customAddress, setCustomAddress] = useState('');
  const [severity, setSeverity] = useState<number>(3);
  const [reporterName, setReporterName] = useState('');

  // AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<AiDetectionResult | null>(null);

  // Submission Toast / Confirmation State
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);

  // Store
  const {
    reports,
    selectedReport,
    filterCategory,
    filterStatus,
    searchQuery,
    addReport,
    updateReportStatus,
    upvoteReport,
    setSelectedReport,
    setFilterCategory,
    setFilterStatus,
    setSearchQuery,
  } = useCitizenReportStore();

  const handleImageAdded = (newImage: string) => {
    setIsAnalyzing(true);
    setAiResult(null);
    setTimeout(() => {
      const result = simulateAiAnalysis(newImage);
      setAiResult(result);
      setIsAnalyzing(false);
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const locPreset = PRESET_LOCATIONS[selectedLocationIdx];
    const finalAddress = customAddress.trim() || locPreset.address;
    const catObj = CATEGORY_OPTIONS.find((c) => c.id === category);

    const newRep = addReport({
      category,
      categoryLabel: catObj ? catObj.label : 'Civic Problem',
      title: title.trim(),
      description: description.trim(),
      images,
      location: {
        address: finalAddress,
        zoneId: locPreset.zoneId,
        lat: locPreset.lat,
        lng: locPreset.lng,
      },
      severity,
      reporterName: reporterName.trim() || 'Anonymous Resident',
      aiAnalysis: aiResult,
    });

    setSubmittedReportId(newRep.id);
    // Reset Form
    setTitle('');
    setDescription('');
    setImages([]);
    setAiResult(null);
  };

  const filteredReports = reports.filter((r) => {
    if (filterCategory !== 'all' && r.category !== filterCategory) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = r.id.toLowerCase().includes(q);
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchLoc = r.location.address.toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchLoc) return false;
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-text tracking-tight font-heading">
              Citizen Civic Issue Reporting
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-accent/15 text-accent font-bold text-xs border border-accent/30">
              CityPulse Civic Health
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Report local infrastructure issues directly to CityPulse AI monitoring & municipal team.
          </p>
        </div>

        {/* Action Toggle */}
        <div className="flex items-center gap-2 bg-surface-2 p-1.5 rounded-2xl border border-border">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'feed'
                ? 'bg-surface text-accent shadow-sm border border-border font-bold'
                : 'text-muted hover:text-text'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>Reports Feed ({reports.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-accent text-white shadow-md shadow-accent/20 font-bold'
                : 'text-muted hover:text-text'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report an Issue</span>
          </button>
        </div>
      </div>

      {/* SUBMISSION CONFIRMATION MODAL / TOAST */}
      {submittedReportId && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 flex items-center justify-between animate-fade-in shadow-md">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold">Report Submitted Successfully!</h4>
              <p className="text-xs opacity-90 mt-0.5">
                Your report ID is <strong className="font-mono underline">{submittedReportId}</strong>. It has been synced to the CityPulse incident monitoring map.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('feed');
                setSubmittedReportId(null);
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-colors cursor-pointer"
            >
              View in Feed
            </button>
            <button
              onClick={() => setSubmittedReportId(null)}
              className="text-xs text-muted hover:text-text px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* CREATE REPORT TAB */}
      {activeTab === 'create' && (
        <div className="max-w-3xl mx-auto">
          <Card className="p-6 space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-base font-bold text-text">New Complaint Submission</h2>
              <p className="text-xs text-muted mt-0.5">
                Provide details and photo evidence of the civic problem in your area.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload Step */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-text uppercase tracking-wider">
                  1. Photo Evidence
                </label>
                <ImageUploader
                  images={images}
                  onChange={setImages}
                  onImageAdded={handleImageAdded}
                  maxImages={4}
                />
              </div>

              {/* Demo AI Image Analysis Card */}
              <AiAnalysisCard
                isAnalyzing={isAnalyzing}
                result={aiResult}
                selectedCategory={category}
                onApplyCategory={(cat) => setCategory(cat)}
              />

              {/* Category Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-text uppercase tracking-wider">
                  2. Select Issue Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {CATEGORY_OPTIONS.map((opt) => {
                    const isSelected = category === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setCategory(opt.id)}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-accent/15 border-accent text-accent font-bold shadow-sm'
                            : 'bg-surface-2/60 border-border text-text hover:bg-surface-2'
                        }`}
                      >
                        <span className="text-lg">{opt.icon}</span>
                        <span className="text-xs leading-tight">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Description */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text uppercase tracking-wider">
                    3. Problem Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Large Pothole near Central Bus Stop"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-2 text-text text-sm focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text uppercase tracking-wider">
                    4. Short Description
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the issue, estimated depth/size, hazard level..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-2 text-text text-sm focus:outline-none focus:border-accent resize-none"
                  />
                </div>
              </div>

              {/* Location Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-text uppercase tracking-wider">
                  5. Location
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={selectedLocationIdx}
                    onChange={(e) => setSelectedLocationIdx(Number(e.target.value))}
                    className="px-3.5 py-2.5 rounded-xl border border-border bg-surface-2 text-text text-sm focus:outline-none focus:border-accent"
                  >
                    {PRESET_LOCATIONS.map((loc, i) => (
                      <option key={i} value={i}>
                        {loc.address} ({loc.zoneId.toUpperCase()})
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    placeholder="Or enter custom address..."
                    className="px-3.5 py-2.5 rounded-xl border border-border bg-surface-2 text-text text-sm focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Severity & Reporter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text">
                    Severity Level (1 - 5)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={severity}
                      onChange={(e) => setSeverity(Number(e.target.value))}
                      className="w-full accent-accent cursor-pointer"
                    />
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-accent/20 text-accent">
                      {severity} / 5
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text">Your Name (Optional)</label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="Anonymous Resident"
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface-2 text-text text-xs focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Submit Action */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setActiveTab('feed')}
                  className="px-4 py-2.5 rounded-xl border border-border text-muted hover:text-text text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-white font-bold text-xs shadow-lg shadow-accent/25 hover:bg-accent/90 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Complaint</span>
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* REPORTS FEED TAB */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          {/* Search & Filters Toolbar */}
          <Card className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-muted absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search report ID, title, address..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border bg-surface-2 text-text text-xs focus:outline-none focus:border-accent"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <Filter className="w-3.5 h-3.5" />
                <span>Category:</span>
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-border bg-surface-2 text-text text-xs focus:outline-none focus:border-accent"
              >
                <option value="all">All Categories</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1.5 text-xs text-muted ml-2">
                <span>Status:</span>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-border bg-surface-2 text-text text-xs focus:outline-none focus:border-accent"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </Card>

          {/* Reports Grid */}
          {filteredReports.length === 0 ? (
            <Card className="p-12 text-center space-y-3">
              <FileText className="w-10 h-10 text-muted mx-auto opacity-50" />
              <h3 className="text-sm font-bold text-text">No Civic Reports Found</h3>
              <p className="text-xs text-muted max-w-sm mx-auto">
                No complaint matches your current filter criteria. Be the first to report an issue!
              </p>
              <button
                onClick={() => setActiveTab('create')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white font-bold text-xs mt-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report an Issue</span>
              </button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onSelect={(r) => setSelectedReport(r)}
                  onUpvote={(id, e) => {
                    e.stopPropagation();
                    upvoteReport(id);
                  }}
                  onStatusChange={(id, st, e) => {
                    e.stopPropagation();
                    updateReportStatus(id, st);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* DETAIL MODAL */}
      <ReportDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onUpvote={(id) => upvoteReport(id)}
        onUpdateStatus={(id, status) => updateReportStatus(id, status)}
      />
    </div>
  );
};
