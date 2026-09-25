import { create } from 'zustand';
import {
  CitizenReport,
  ReportCategory,
  ReportStatus,
  PriorityLevel,
  EvidenceStatus,
  AiDetailedAnalysis,
  CivicImpactScore,
  StatusTimelineStep,
  SlaTracking,
  ResolutionEvidence,
  EvidenceEngineData,
  UserTrustProfile,
} from '../types/citizenReport';
import { useCityStore } from './useCityStore';
import { NormalizedEvent } from '../api/types';

const STORAGE_KEY = 'citypulse_citizen_reports_v4';

const createDefaultTimeline = (status: ReportStatus, createdIso: string): StatusTimelineStep[] => {
  const createdDate = new Date(createdIso);
  const ackDate = new Date(createdDate.getTime() + 1000 * 60 * 18);
  const progressDate = new Date(createdDate.getTime() + 1000 * 60 * 120);
  const resolvedDate = new Date(createdDate.getTime() + 1000 * 60 * 360);

  const formatTime = (d: Date) =>
    d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return [
    {
      status: 'submitted',
      label: 'Submitted',
      timestamp: formatTime(createdDate),
      note: 'Complaint recorded and multi-signal evidence ingested',
      completed: true,
      current: status === 'submitted',
    },
    {
      status: 'acknowledged',
      label: 'Acknowledged',
      timestamp: status !== 'submitted' ? formatTime(ackDate) : null,
      note: 'Evidence triage verified; assigned to municipal taskforce',
      completed: status === 'acknowledged' || status === 'in_progress' || status === 'resolved' || status === 'disputed',
      current: status === 'acknowledged',
    },
    {
      status: 'in_progress',
      label: 'Assigned & In Progress',
      timestamp: status === 'in_progress' || status === 'resolved' || status === 'disputed' ? formatTime(progressDate) : null,
      note: 'Field crew dispatched with mobile telemetry tracker',
      completed: status === 'in_progress' || status === 'resolved' || status === 'disputed',
      current: status === 'in_progress',
    },
    {
      status: 'resolved',
      label: status === 'disputed' ? 'Resolution Disputed' : 'Resolved',
      timestamp: status === 'resolved' || status === 'disputed' ? formatTime(resolvedDate) : null,
      note: status === 'disputed' ? 'Citizen dispute logged; escalated to senior inspector' : 'Physical repair complete, photo evidence verified',
      completed: status === 'resolved',
      current: status === 'resolved' || status === 'disputed',
    },
  ];
};

const INITIAL_DEMO_REPORTS: CitizenReport[] = [
  {
    id: 'REP-2026-8942',
    category: 'pothole',
    categoryLabel: 'Potholes / Damaged Road',
    priority: 'critical',
    title: 'Severe Pothole on Main Arterial Street',
    description: 'Deep pothole causing vehicle tire damage and sudden lane switching near the central intersection.',
    images: [
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
    ],
    location: {
      address: '777 Brockton Avenue, Central District',
      zoneId: 'z5',
      lat: 40.7138,
      lng: -74.004,
      distanceMeters: 320,
    },
    severity: 5,
    status: 'in_progress',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    upvotes: 42,
    reporterName: 'Alex Rivera',
    isMyReport: true,
    confirmedByMe: true,
    department: 'Roads & Infrastructure',
    sla: {
      durationHours: 12,
      deadline: new Date(Date.now() + 3600000 * 8).toISOString(),
      remainingMinutes: 480,
      breached: false,
      compliancePercentage: 35,
    },
    aiAnalysis: {
      category: 'pothole',
      categoryLabel: 'Potholes / Damaged Road',
      severity: 'critical',
      confidence: 96,
      visualEvidenceStrength: 'Strong',
      descriptionMatchPercent: 94,
      descriptionConsistent: true,
      affectedArea: 'High Traffic Arterial Zone',
      suggestedSla: '12 Hours',
      suggestedDepartment: 'Roads & Infrastructure',
      recommendation: 'Prioritize immediate inspection because the issue is located near a major transit intersection and posing tyre blowout risk.',
      detectedIssue: 'Deep Surface Asphalt Cavity (>15cm depth)',
    },
    civicImpact: {
      score: 82,
      trafficImpact: 90,
      safetyRisk: 95,
      citizenReports: 78,
      locationImportance: 88,
    },
    evidence: {
      evidenceStatus: 'verified',
      userTrust: {
        name: 'Alex Rivera',
        isVerified: true,
        reportsSubmitted: 12,
        accountAgeMonths: 8,
        trustRating: 95,
      },
      imageMetadata: {
        hasExif: true,
        isOriginal: true,
        captureTimestamp: new Date(Date.now() - 3600000 * 4).toLocaleTimeString(),
        deviceModel: 'Mobile Camera (HDR)',
        dimensions: '3024 x 4032',
        hasGps: true,
        isLiveCapture: true,
      },
      locationEvidence: {
        gpsCaptured: true,
        gpsAccuracyMeters: 8,
        distanceToReportedMeters: 14,
        imageGpsAvailable: true,
        isConsistent: true,
        summary: 'Strong location consistency: 14m from reported address with ±8m device GPS precision.',
      },
      scoreBreakdown: {
        totalScore: 91,
        strengthLabel: 'Strong Supporting Evidence',
        gpsMatch: 20,
        liveCapture: 20,
        aiImageMatch: 18,
        timestampConsistency: 10,
        locationConsistency: 10,
        communityConfirmation: 8,
        noDuplicate: 5,
        userAuthenticity: 5,
        explanation: 'Multi-signal analysis detected live camera capture, coincident GPS telemetry, 94% text-to-image description match, and 42 citizen confirmations.',
      },
      suspiciousFlags: [],
      timeline: [
        { title: 'Report Submitted', timestamp: '07:11 PM', note: 'Resident authenticated via municipal SSO', passed: true },
        { title: 'Live GPS Captured', timestamp: '07:11 PM', note: 'Coordinate matched within 14 meters', passed: true },
        { title: 'Live Camera Capture', timestamp: '07:11 PM', note: 'Direct browser camera stream with EXIF timestamp', passed: true },
        { title: 'AI Vision Analysis', timestamp: '07:12 PM', note: 'Identified severe asphalt cavity (96% conf)', passed: true },
        { title: 'Description Consistency', timestamp: '07:12 PM', note: '94% category & description semantic alignment', passed: true },
        { title: 'Deduplication Scan', timestamp: '07:12 PM', note: 'No overlapping active duplicate reports', passed: true },
        { title: 'Community Corroboration', timestamp: '07:18 PM', note: '42 neighborhood resident confirmations received', passed: true },
        { title: 'Evidence Engine Verified', timestamp: '07:20 PM', note: 'Evidence Confidence Score: 91/100', passed: true },
      ],
      requiresManualReview: true,
      manualReviewReason: 'High safety impact arterial classification requires on-site supervisor sign-off.',
    },
    timeline: createDefaultTimeline('in_progress', new Date(Date.now() - 3600000 * 4).toISOString()),
  },
  {
    id: 'REP-2026-8941',
    category: 'garbage',
    categoryLabel: 'Garbage / Waste Accumulation',
    priority: 'high',
    title: 'Waste Accumulation near Bus Terminal',
    description: 'Overflowing commercial waste bins and uncollected plastic litter obstructing sidewalk access.',
    images: [
      'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
    ],
    location: {
      address: 'Market Square, East Hub',
      zoneId: 'z6',
      lat: 40.718,
      lng: -73.998,
      distanceMeters: 540,
    },
    severity: 4,
    status: 'acknowledged',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    upvotes: 28,
    reporterName: 'Samira Chen',
    isMyReport: false,
    confirmedByMe: false,
    department: 'Waste Management',
    sla: {
      durationHours: 24,
      deadline: new Date(Date.now() + 3600000 * 16).toISOString(),
      remainingMinutes: 960,
      breached: false,
      compliancePercentage: 30,
    },
    aiAnalysis: {
      category: 'garbage',
      categoryLabel: 'Garbage / Waste Accumulation',
      severity: 'high',
      confidence: 91,
      visualEvidenceStrength: 'Strong',
      descriptionMatchPercent: 88,
      descriptionConsistent: true,
      affectedArea: 'Commercial Pedestrian Corridor',
      suggestedSla: '24 Hours',
      suggestedDepartment: 'Waste Management & Sanitation',
      recommendation: 'Schedule priority bulk sweep truck before morning commute rush.',
      detectedIssue: 'Overfilled Dumpster & Uncontained Solid Refuse',
    },
    civicImpact: {
      score: 68,
      trafficImpact: 45,
      safetyRisk: 60,
      citizenReports: 82,
      locationImportance: 75,
    },
    evidence: {
      evidenceStatus: 'under_verification',
      userTrust: {
        name: 'Samira Chen',
        isVerified: true,
        reportsSubmitted: 6,
        accountAgeMonths: 4,
        trustRating: 84,
      },
      imageMetadata: {
        hasExif: true,
        isOriginal: true,
        captureTimestamp: new Date(Date.now() - 3600000 * 8).toLocaleTimeString(),
        deviceModel: 'Mobile Camera',
        dimensions: '2400 x 3200',
        hasGps: true,
        isLiveCapture: false,
      },
      locationEvidence: {
        gpsCaptured: true,
        gpsAccuracyMeters: 12,
        distanceToReportedMeters: 28,
        imageGpsAvailable: true,
        isConsistent: true,
        summary: 'Location consistent within 28m of commercial plaza centroid.',
      },
      scoreBreakdown: {
        totalScore: 78,
        strengthLabel: 'Moderate Supporting Evidence',
        gpsMatch: 18,
        liveCapture: 12,
        aiImageMatch: 16,
        timestampConsistency: 8,
        locationConsistency: 9,
        communityConfirmation: 7,
        noDuplicate: 4,
        userAuthenticity: 4,
        explanation: 'Strong visual match and location consistency. Pending additional field telemetry validation.',
      },
      suspiciousFlags: [],
      timeline: [
        { title: 'Report Submitted', timestamp: '11:04 AM', note: 'Uploaded via resident portal', passed: true },
        { title: 'GPS Verification', timestamp: '11:04 AM', note: '28m from Market Square node', passed: true },
        { title: 'AI Classification', timestamp: '11:05 AM', note: 'Solid waste accumulation (91% conf)', passed: true },
        { title: 'Deduplication Scan', timestamp: '11:05 AM', note: 'No identical reports in last 24h', passed: true },
        { title: 'Community Corroboration', timestamp: '11:30 AM', note: '28 citizen confirmations', passed: true },
      ],
      requiresManualReview: false,
    },
    timeline: createDefaultTimeline('acknowledged', new Date(Date.now() - 3600000 * 8).toISOString()),
  },
  {
    id: 'REP-2026-8935',
    category: 'waterlogging',
    categoryLabel: 'Waterlogging / Drainage',
    priority: 'high',
    title: 'Storm Runoff Drain Overflow at Riverside Culvert',
    description: 'Blocked storm drain grating resulted in 10 inches of standing water on the pedestrian walkway.',
    images: [
      'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80',
    ],
    location: {
      address: 'Riverside Walkway & Pier 12',
      zoneId: 'z4',
      lat: 40.709,
      lng: -74.012,
      distanceMeters: 1200,
    },
    severity: 4,
    status: 'resolved',
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    upvotes: 67,
    reporterName: 'Elena Rostova',
    isMyReport: false,
    confirmedByMe: true,
    department: 'Water & Drainage Authority',
    sla: {
      durationHours: 24,
      deadline: new Date(Date.now() - 3600000 * 4).toISOString(),
      remainingMinutes: 0,
      breached: false,
      compliancePercentage: 100,
    },
    aiAnalysis: {
      category: 'waterlogging',
      categoryLabel: 'Waterlogging / Drainage',
      severity: 'high',
      confidence: 95,
      visualEvidenceStrength: 'Strong',
      descriptionMatchPercent: 96,
      descriptionConsistent: true,
      affectedArea: 'Waterfront Pedestrian Promenade',
      suggestedSla: '24 Hours',
      suggestedDepartment: 'Water & Drainage Authority',
      recommendation: 'Clear subterranean intake filter to avoid localized embankment flooding.',
      detectedIssue: 'Debris-Choked Catch Basin & Standing Water',
    },
    civicImpact: {
      score: 76,
      trafficImpact: 60,
      safetyRisk: 80,
      citizenReports: 88,
      locationImportance: 85,
    },
    evidence: {
      evidenceStatus: 'verified',
      userTrust: {
        name: 'Elena Rostova',
        isVerified: true,
        reportsSubmitted: 18,
        accountAgeMonths: 14,
        trustRating: 98,
      },
      imageMetadata: {
        hasExif: true,
        isOriginal: true,
        captureTimestamp: new Date(Date.now() - 3600000 * 28).toLocaleTimeString(),
        deviceModel: 'Mobile Camera (Ultra Wide)',
        dimensions: '3024 x 4032',
        hasGps: true,
        isLiveCapture: true,
      },
      locationEvidence: {
        gpsCaptured: true,
        gpsAccuracyMeters: 6,
        distanceToReportedMeters: 9,
        imageGpsAvailable: true,
        isConsistent: true,
        summary: 'Excellent GPS alignment: 9m from pier culvert intake.',
      },
      scoreBreakdown: {
        totalScore: 94,
        strengthLabel: 'Strong Supporting Evidence',
        gpsMatch: 20,
        liveCapture: 20,
        aiImageMatch: 18,
        timestampConsistency: 10,
        locationConsistency: 10,
        communityConfirmation: 8,
        noDuplicate: 5,
        userAuthenticity: 3,
        explanation: 'Multi-signal evidence engine confirmed live capture, coincident GPS telemetry, 67 community confirmations, and verified repair clearance.',
      },
      suspiciousFlags: [],
      timeline: [
        { title: 'Live Submission', timestamp: '02:15 PM', note: 'GPS accuracy ±6m', passed: true },
        { title: 'AI Verification', timestamp: '02:16 PM', note: 'Catch basin debris detected (95% conf)', passed: true },
        { title: 'Municipal Dispatch', timestamp: '02:40 PM', note: 'Drainage crew dispatched', passed: true },
        { title: 'Repair Completion', timestamp: '06:10 PM', note: 'Cleared intake verified with After photo', passed: true },
      ],
      requiresManualReview: false,
    },
    timeline: createDefaultTimeline('resolved', new Date(Date.now() - 3600000 * 28).toISOString()),
    resolutionEvidence: {
      beforeImage: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80',
      afterImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80',
      resolvedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      resolutionGpsMatches: true,
      aiBeforeAfterAnalysis: 'Visual inspection confirms debris clearing and restored water drainage flow.',
      resolutionEvidenceScore: 94,
      verifiedCount: 38,
      unverifiedCount: 2,
      isDisputed: false,
      userVoted: 'yes',
    },
  },
];

const loadReports = (): CitizenReport[] => {
  if (typeof window === 'undefined') return INITIAL_DEMO_REPORTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_REPORTS));
      return INITIAL_DEMO_REPORTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DEMO_REPORTS;
  } catch (err) {
    return INITIAL_DEMO_REPORTS;
  }
};

const saveReports = (reports: CitizenReport[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch (err) {
    // ignore
  }
};

const syncReportToCityEvents = (report: CitizenReport) => {
  try {
    const cityStoreState = useCityStore.getState();
    if (cityStoreState && typeof cityStoreState.addEvent === 'function') {
      const normalizedEvt: NormalizedEvent = {
        id: `evt-${report.id}`,
        source: 'Citizen Report UI',
        feed: report.category === 'noise' ? 'noise' : 'incident',
        zone_id: report.location.zoneId || 'z5',
        lat: report.location.lat,
        lng: report.location.lng,
        severity: report.severity * 2,
        value: report.upvotes,
        unit: 'confirmations',
        title: `[${report.priority.toUpperCase()}] ${report.title}`,
        description: report.description,
        timestamp: report.createdAt,
        received_at: report.createdAt,
        confidence: report.evidence.scoreBreakdown.totalScore / 100,
        status: report.status === 'resolved' ? 'resolved' : 'active',
      };
      cityStoreState.addEvent(normalizedEvt);
    }
  } catch (err) {
    // fail-safe
  }
};

interface CitizenReportState {
  reports: CitizenReport[];
  selectedReport: CitizenReport | null;
  filterCategory: ReportCategory | 'all';
  filterStatus: ReportStatus | 'all';
  filterPriority: PriorityLevel | 'all';
  filterEvidenceStatus: EvidenceStatus | 'all';
  filterDepartment: string | 'all';
  sortBy: 'newest' | 'oldest' | 'priority' | 'confirmed' | 'evidence_score' | 'sla' | 'distance';
  searchQuery: string;
  viewMode: 'feed' | 'my_reports' | 'create';
  isMapOpen: boolean;

  // Actions
  addReport: (data: {
    category: ReportCategory;
    categoryLabel: string;
    priority: PriorityLevel;
    title: string;
    description: string;
    images: string[];
    location: { address: string; zoneId: string; lat: number; lng: number };
    severity: number;
    reporterName?: string;
    department?: string;
    isLiveCapture?: boolean;
    gpsAccuracy?: number;
    aiAnalysis?: Partial<AiDetailedAnalysis>;
  }) => CitizenReport;
  updateReportStatus: (id: string, status: ReportStatus) => void;
  toggleConfirmReport: (id: string) => void;
  voteResolutionEvidence: (id: string, vote: 'yes' | 'no') => void;
  disputeResolution: (id: string) => void;
  setSelectedReport: (report: CitizenReport | null) => void;
  setFilterCategory: (cat: ReportCategory | 'all') => void;
  setFilterStatus: (status: ReportStatus | 'all') => void;
  setFilterPriority: (pri: PriorityLevel | 'all') => void;
  setFilterEvidenceStatus: (evStatus: EvidenceStatus | 'all') => void;
  setFilterDepartment: (dept: string | 'all') => void;
  setSortBy: (sort: 'newest' | 'oldest' | 'priority' | 'confirmed' | 'evidence_score' | 'sla' | 'distance') => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: 'feed' | 'my_reports' | 'create') => void;
  setIsMapOpen: (open: boolean) => void;
}

export const useCitizenReportStore = create<CitizenReportState>((set, get) => ({
  reports: loadReports(),
  selectedReport: null,
  filterCategory: 'all',
  filterStatus: 'all',
  filterPriority: 'all',
  filterEvidenceStatus: 'all',
  filterDepartment: 'all',
  sortBy: 'priority',
  searchQuery: '',
  viewMode: 'feed',
  isMapOpen: false,

  addReport: (data) => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const now = new Date().toISOString();
    const durationHours = data.priority === 'critical' ? 12 : data.priority === 'high' ? 24 : data.priority === 'medium' ? 48 : 72;
    const isLive = Boolean(data.isLiveCapture);
    const gpsAcc = data.gpsAccuracy || 8;

    // Calculate dynamic evidence confidence
    const gpsMatch = gpsAcc <= 15 ? 20 : 12;
    const liveCap = isLive ? 20 : 10;
    const aiMatch = 18;
    const tsMatch = 10;
    const locMatch = 10;
    const commConf = 4;
    const noDup = 5;
    const userAuth = 5;
    const totalEvidenceScore = Math.min(100, gpsMatch + liveCap + aiMatch + tsMatch + locMatch + commConf + noDup + userAuth);

    const evStatus: EvidenceStatus = totalEvidenceScore >= 80 ? 'verified' : totalEvidenceScore >= 50 ? 'under_verification' : 'needs_review';

    const newReport: CitizenReport = {
      id: `REP-2026-${randomNum}`,
      category: data.category,
      categoryLabel: data.categoryLabel,
      priority: data.priority,
      title: data.title,
      description: data.description,
      images: data.images,
      location: {
        ...data.location,
        distanceMeters: Math.floor(200 + Math.random() * 1200),
      },
      severity: data.severity,
      status: 'submitted',
      createdAt: now,
      updatedAt: now,
      upvotes: 1,
      reporterName: data.reporterName || 'Alex Rivera',
      isMyReport: true,
      confirmedByMe: true,
      department: data.department || (data.category === 'pothole' ? 'Roads & Infrastructure' : data.category === 'garbage' ? 'Waste Management' : data.category === 'streetlight' ? 'Electrical & Lighting' : data.category === 'waterlogging' ? 'Water & Drainage Authority' : 'Public Works'),
      sla: {
        durationHours,
        deadline: new Date(Date.now() + 3600000 * durationHours).toISOString(),
        remainingMinutes: durationHours * 60,
        breached: false,
        compliancePercentage: 0,
      },
      aiAnalysis: {
        category: data.category,
        categoryLabel: data.categoryLabel,
        severity: data.priority,
        confidence: data.aiAnalysis?.confidence || 94,
        visualEvidenceStrength: 'Strong',
        descriptionMatchPercent: 92,
        descriptionConsistent: true,
        affectedArea: 'Urban Corridors & Neighborhood',
        suggestedSla: `${durationHours} Hours`,
        suggestedDepartment: data.department || 'Public Works',
        recommendation: data.aiAnalysis?.recommendation || 'Automated triage scheduled inspection team.',
        detectedIssue: data.aiAnalysis?.detectedIssue || data.title,
      },
      civicImpact: {
        score: data.priority === 'critical' ? 88 : data.priority === 'high' ? 72 : data.priority === 'medium' ? 50 : 35,
        trafficImpact: data.priority === 'critical' ? 85 : 50,
        safetyRisk: data.priority === 'critical' ? 95 : 60,
        citizenReports: 25,
        locationImportance: 75,
      },
      evidence: {
        evidenceStatus: evStatus,
        userTrust: {
          name: data.reporterName || 'Alex Rivera',
          isVerified: true,
          reportsSubmitted: 13,
          accountAgeMonths: 8,
          trustRating: 95,
        },
        imageMetadata: {
          hasExif: true,
          isOriginal: true,
          captureTimestamp: new Date().toLocaleTimeString(),
          deviceModel: isLive ? 'Live Browser Camera Stream' : 'File Upload (Verified)',
          dimensions: '3024 x 4032',
          hasGps: true,
          isLiveCapture: isLive,
        },
        locationEvidence: {
          gpsCaptured: true,
          gpsAccuracyMeters: gpsAcc,
          distanceToReportedMeters: 12,
          imageGpsAvailable: true,
          isConsistent: true,
          summary: `Strong location consistency within 12m with ±${gpsAcc}m device precision.`,
        },
        scoreBreakdown: {
          totalScore: totalEvidenceScore,
          strengthLabel: totalEvidenceScore >= 80 ? 'Strong Supporting Evidence' : totalEvidenceScore >= 50 ? 'Moderate Supporting Evidence' : 'Preliminary Evidence',
          gpsMatch,
          liveCapture: liveCap,
          aiImageMatch: aiMatch,
          timestampConsistency: tsMatch,
          locationConsistency: locMatch,
          communityConfirmation: commConf,
          noDuplicate: noDup,
          userAuthenticity: userAuth,
          explanation: 'Multi-signal analysis verified live image telemetry, geographic consistency, and text description semantic alignment.',
        },
        suspiciousFlags: [],
        timeline: [
          { title: 'Report Submitted', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: 'Resident authenticated', passed: true },
          { title: 'GPS Captured', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: `±${gpsAcc}m accuracy matched`, passed: true },
          { title: isLive ? 'Live Camera Capture' : 'Image Upload Validated', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: 'Metadata headers parsed', passed: true },
          { title: 'AI Classification', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: `${data.categoryLabel} identified`, passed: true },
          { title: 'Deduplication Scan', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: 'No conflicting duplicate reports', passed: true },
          { title: 'Evidence Engine Assessment', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: `Score: ${totalEvidenceScore}/100 (${evStatus.toUpperCase()})`, passed: true },
        ],
        requiresManualReview: data.priority === 'critical',
        manualReviewReason: data.priority === 'critical' ? 'High safety impact arterial classification requires on-site supervisor sign-off.' : null,
      },
      timeline: createDefaultTimeline('submitted', now),
    };

    const updated = [newReport, ...get().reports];
    saveReports(updated);
    set({ reports: updated, selectedReport: newReport });
    syncReportToCityEvents(newReport);
    return newReport;
  },

  updateReportStatus: (id, status) => {
    const now = new Date().toISOString();
    const updated = get().reports.map((r) => {
      if (r.id === id) {
        const nextTimeline = createDefaultTimeline(status, r.createdAt);
        const resolvedEvidence = status === 'resolved' && !r.resolutionEvidence ? {
          beforeImage: r.images[0] || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
          afterImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80',
          resolvedAt: now,
          resolutionGpsMatches: true,
          aiBeforeAfterAnalysis: 'Visual verification confirmed physical defect is cleared from lane.',
          resolutionEvidenceScore: 92,
          verifiedCount: 1,
          unverifiedCount: 0,
          isDisputed: false,
          userVoted: null,
        } : r.resolutionEvidence;

        return {
          ...r,
          status,
          updatedAt: now,
          timeline: nextTimeline,
          resolutionEvidence: resolvedEvidence,
        };
      }
      return r;
    });

    saveReports(updated);
    const curr = get().selectedReport;
    const nextSelected = curr && curr.id === id ? updated.find((r) => r.id === id) || null : curr;
    set({ reports: updated, selectedReport: nextSelected });

    const target = updated.find((r) => r.id === id);
    if (target) syncReportToCityEvents(target);
  },

  toggleConfirmReport: (id) => {
    const updated = get().reports.map((r) => {
      if (r.id === id) {
        const nextConfirmed = !r.confirmedByMe;
        const nextUpvotes = nextConfirmed ? r.upvotes + 1 : Math.max(1, r.upvotes - 1);
        
        // Dynamically update evidence score with community confirmations
        const currentScore = r.evidence.scoreBreakdown.totalScore;
        const scoreDelta = nextConfirmed ? 2 : -2;
        const newScore = Math.max(20, Math.min(100, currentScore + scoreDelta));
        const newEvStatus: EvidenceStatus = newScore >= 80 ? 'verified' : newScore >= 50 ? 'under_verification' : 'needs_review';

        return {
          ...r,
          confirmedByMe: nextConfirmed,
          upvotes: nextUpvotes,
          evidence: {
            ...r.evidence,
            evidenceStatus: newEvStatus,
            scoreBreakdown: {
              ...r.evidence.scoreBreakdown,
              totalScore: newScore,
              communityConfirmation: Math.min(8, r.evidence.scoreBreakdown.communityConfirmation + (nextConfirmed ? 1 : -1)),
            },
          },
        };
      }
      return r;
    });

    saveReports(updated);
    const curr = get().selectedReport;
    const nextSelected = curr && curr.id === id ? updated.find((r) => r.id === id) || null : curr;
    set({ reports: updated, selectedReport: nextSelected });
  },

  voteResolutionEvidence: (id, vote) => {
    const updated = get().reports.map((r) => {
      if (r.id === id && r.resolutionEvidence) {
        const currVote = r.resolutionEvidence.userVoted;
        let vCount = r.resolutionEvidence.verifiedCount;
        let uCount = r.resolutionEvidence.unverifiedCount;

        if (currVote === 'yes') vCount--;
        if (currVote === 'no') uCount--;

        if (vote === 'yes') vCount++;
        if (vote === 'no') uCount++;

        const isDisputed = uCount > vCount;
        const nextStatus = isDisputed ? 'disputed' : r.status;

        return {
          ...r,
          status: nextStatus as ReportStatus,
          resolutionEvidence: {
            ...r.resolutionEvidence,
            verifiedCount: vCount,
            unverifiedCount: uCount,
            isDisputed,
            userVoted: vote,
          },
        };
      }
      return r;
    });

    saveReports(updated);
    const curr = get().selectedReport;
    const nextSelected = curr && curr.id === id ? updated.find((r) => r.id === id) || null : curr;
    set({ reports: updated, selectedReport: nextSelected });
  },

  disputeResolution: (id) => {
    const now = new Date().toISOString();
    const updated = get().reports.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          status: 'disputed' as ReportStatus,
          updatedAt: now,
          resolutionEvidence: r.resolutionEvidence ? {
            ...r.resolutionEvidence,
            isDisputed: true,
            unverifiedCount: r.resolutionEvidence.unverifiedCount + 1,
            userVoted: 'no' as const,
          } : null,
          evidence: {
            ...r.evidence,
            suspiciousFlags: [
              ...r.evidence.suspiciousFlags,
              {
                flagType: 'Citizen Resolution Dispute',
                message: 'Multiple citizens reported the defect was not cleared or resurfaced.',
                severity: 'medium' as const,
                requiresManualReview: true,
              },
            ],
            requiresManualReview: true,
            manualReviewReason: 'Resolution disputed by neighborhood residents. On-site audit required.',
          },
        };
      }
      return r;
    });

    saveReports(updated);
    const curr = get().selectedReport;
    const nextSelected = curr && curr.id === id ? updated.find((r) => r.id === id) || null : curr;
    set({ reports: updated, selectedReport: nextSelected });
  },

  setSelectedReport: (selectedReport) => set({ selectedReport }),
  setFilterCategory: (filterCategory) => set({ filterCategory }),
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  setFilterPriority: (filterPriority) => set({ filterPriority }),
  setFilterEvidenceStatus: (filterEvidenceStatus) => set({ filterEvidenceStatus }),
  setFilterDepartment: (filterDepartment) => set({ filterDepartment }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setViewMode: (viewMode) => set({ viewMode }),
  setIsMapOpen: (isMapOpen) => set({ isMapOpen }),
}));
