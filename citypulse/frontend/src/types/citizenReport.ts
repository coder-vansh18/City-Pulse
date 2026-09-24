export type ReportCategory = 
  | 'pothole'
  | 'garbage'
  | 'waterlogging'
  | 'streetlight'
  | 'traffic'
  | 'noise'
  | 'other';

export type ReportStatus = 'submitted' | 'acknowledged' | 'in_progress' | 'resolved';

export interface LocationInfo {
  address: string;
  zoneId: string;
  lat: number;
  lng: number;
}

export interface AiDetectionResult {
  isDemo: true;
  detectedIssue: string;
  confidence: number;
  suggestedCategory: ReportCategory;
  categoryLabel: string;
}

export interface CitizenReport {
  id: string;
  category: ReportCategory;
  categoryLabel: string;
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
  aiAnalysis?: AiDetectionResult | null;
}
