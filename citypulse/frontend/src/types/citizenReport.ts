export type ReportCategory = 
  | 'pothole'
  | 'garbage'
  | 'waterlogging'
  | 'streetlight'
  | 'traffic'
  | 'noise'
  | 'other';

export type ReportStatus = 'submitted' | 'acknowledged' | 'in_progress' | 'resolved' | 'disputed';

export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';

export type EvidenceStatus = 'submitted' | 'under_verification' | 'verified' | 'needs_review';

export interface LocationInfo {
  address: string;
  zoneId: string;
  lat: number;
  lng: number;
  distanceMeters?: number;
}

export interface UserTrustProfile {
  name: string;
  isVerified: boolean;
  reportsSubmitted: number;
  accountAgeMonths: number;
  trustRating: number; // 0-100
}

export interface ImageMetadataInfo {
  hasExif: boolean;
  isOriginal: boolean;
  captureTimestamp?: string;
  deviceModel?: string;
  dimensions?: string;
  hasGps: boolean;
  isLiveCapture: boolean;
}

export interface LocationEvidenceData {
  gpsCaptured: boolean;
  gpsAccuracyMeters: number;
  distanceToReportedMeters: number;
  imageGpsAvailable: boolean;
  isConsistent: boolean;
  summary: string;
}

export interface AiDetailedAnalysis {
  category: ReportCategory;
  categoryLabel: string;
  severity: PriorityLevel;
  confidence: number;
  visualEvidenceStrength: 'Strong' | 'Moderate' | 'Weak';
  descriptionMatchPercent: number;
  descriptionConsistent: boolean;
  affectedArea: string;
  suggestedSla: string;
  suggestedDepartment: string;
  recommendation: string;
  detectedIssue: string;
}

export interface AiDetectionResult {
  isDemo: true;
  detectedIssue: string;
  confidence: number;
  suggestedCategory: ReportCategory;
  categoryLabel: string;
}

export interface CivicImpactScore {
  score: number; // 0-100
  trafficImpact: number; // 0-100
  safetyRisk: number; // 0-100
  citizenReports: number; // 0-100
  locationImportance: number; // 0-100
}

export interface EvidenceScoreBreakdown {
  totalScore: number; // 0-100
  strengthLabel: 'Strong Supporting Evidence' | 'Moderate Supporting Evidence' | 'Preliminary Evidence' | 'Insufficient / Needs Review';
  gpsMatch: number; // max 20
  liveCapture: number; // max 20
  aiImageMatch: number; // max 18
  timestampConsistency: number; // max 10
  locationConsistency: number; // max 10
  communityConfirmation: number; // max 8
  noDuplicate: number; // max 5
  userAuthenticity: number; // max 5
  explanation: string;
}

export interface SuspiciousFlag {
  flagType: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  requiresManualReview: boolean;
}

export interface EvidenceTimelineStep {
  title: string;
  timestamp: string;
  note: string;
  passed: boolean;
}

export interface EvidenceEngineData {
  evidenceStatus: EvidenceStatus;
  userTrust: UserTrustProfile;
  imageMetadata: ImageMetadataInfo;
  locationEvidence: LocationEvidenceData;
  scoreBreakdown: EvidenceScoreBreakdown;
  suspiciousFlags: SuspiciousFlag[];
  timeline: EvidenceTimelineStep[];
  requiresManualReview: boolean;
  manualReviewReason?: string | null;
}

export interface StatusTimelineStep {
  status: ReportStatus;
  label: string;
  timestamp: string | null;
  note: string;
  completed: boolean;
  current: boolean;
}

export interface SlaTracking {
  durationHours: number;
  deadline: string;
  remainingMinutes: number;
  breached: boolean;
  compliancePercentage: number;
}

export interface ResolutionEvidence {
  beforeImage: string;
  afterImage: string;
  resolvedAt: string;
  resolutionGpsMatches: boolean;
  aiBeforeAfterAnalysis: string;
  resolutionEvidenceScore: number; // 0-100
  verifiedCount: number;
  unverifiedCount: number;
  isDisputed: boolean;
  userVoted?: 'yes' | 'no' | null;
}

export interface CitizenReport {
  id: string;
  category: ReportCategory;
  categoryLabel: string;
  priority: PriorityLevel;
  title: string;
  description: string;
  images: string[];
  location: LocationInfo;
  severity: number; // 1-5 scale
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  reporterName?: string;
  isMyReport?: boolean;
  confirmedByMe?: boolean;
  department: string;
  sla: SlaTracking;
  aiAnalysis: AiDetailedAnalysis;
  civicImpact: CivicImpactScore;
  evidence: EvidenceEngineData;
  timeline: StatusTimelineStep[];
  resolutionEvidence?: ResolutionEvidence | null;
}
