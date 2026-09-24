import { create } from 'zustand';
import { CitizenReport, ReportCategory, ReportStatus } from '../types/citizenReport';
import { useCityStore } from './useCityStore';
import { NormalizedEvent } from '../api/types';

const STORAGE_KEY = 'citypulse_citizen_reports';

const INITIAL_DEMO_REPORTS: CitizenReport[] = [
  {
    id: 'REP-2026-8942',
    category: 'pothole',
    categoryLabel: 'Potholes / Damaged Road',
    title: 'Severe Pothole on Main Arterial Street',
    description: 'Deep pothole causing vehicle tire damage and sudden lane switching near the central intersection.',
    images: [
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
    ],
    location: {
      address: '777 Brockton Avenue, Central District',
      zoneId: 'z1',
      lat: 12.9716,
      lng: 77.5946,
    },
    severity: 4,
    status: 'in_progress',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    upvotes: 42,
    reporterName: 'Alex Rivera',
    aiAnalysis: {
      isDemo: true,
      detectedIssue: 'Severe Asphalt Crack & Pothole',
      confidence: 94,
      suggestedCategory: 'pothole',
      categoryLabel: 'Potholes / Damaged Road',
    },
  },
  {
    id: 'REP-2026-8941',
    category: 'garbage',
    categoryLabel: 'Garbage / Waste Accumulation',
    title: 'Waste Accumulation near Bus Terminal',
    description: 'Overflowing bins and uncollected plastic waste blocking pedestrian pathway.',
    images: [
      'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
    ],
    location: {
      address: 'Market Square, East Hub',
      zoneId: 'z2',
      lat: 12.978,
      lng: 77.601,
    },
    severity: 3,
    status: 'acknowledged',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    upvotes: 19,
    reporterName: 'Samira Chen',
    aiAnalysis: {
      isDemo: true,
      detectedIssue: 'Solid Waste Accumulation',
      confidence: 88,
      suggestedCategory: 'garbage',
      categoryLabel: 'Garbage / Waste Accumulation',
    },
  },
  {
    id: 'REP-2026-8940',
    category: 'streetlight',
    categoryLabel: 'Broken Streetlight',
    title: 'Dark Intersection due to Broken Lamp Post',
    description: 'Streetlight pole #42 flickering and completely unlit since yesterday evening.',
    images: [
      'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80',
    ],
    location: {
      address: 'Pine Street & 5th Avenue',
      zoneId: 'z3',
      lat: 12.965,
      lng: 77.585,
    },
    severity: 2,
    status: 'submitted',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    upvotes: 7,
    reporterName: 'David K.',
    aiAnalysis: null,
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
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse saved reports from localStorage', err);
    return INITIAL_DEMO_REPORTS;
  }
};

const saveReports = (reports: CitizenReport[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch (err) {
    console.error('Failed to save reports to localStorage', err);
  }
};

// Map citizen report category to feed type for city store
const mapCategoryToFeed = (category: ReportCategory) => {
  if (category === 'noise') return 'noise';
  return 'incident';
};

// Auto-sync a citizen report to the global CityPulse events list
const syncReportToCityEvents = (report: CitizenReport) => {
  try {
    const cityStoreState = useCityStore.getState();
    if (cityStoreState && typeof cityStoreState.addEvent === 'function') {
      const normalizedEvt: NormalizedEvent = {
        id: `evt-${report.id}`,
        source: 'Citizen Report UI',
        feed: mapCategoryToFeed(report.category),
        zone_id: report.location.zoneId || 'z1',
        lat: report.location.lat,
        lng: report.location.lng,
        severity: report.severity * 2, // scale 1-5 to 2-10
        value: report.upvotes,
        unit: 'upvotes',
        title: `[Citizen Report] ${report.title}`,
        description: report.description,
        timestamp: report.createdAt,
        received_at: report.createdAt,
        confidence: report.aiAnalysis ? report.aiAnalysis.confidence / 100 : 0.9,
        status: report.status === 'resolved' ? 'resolved' : 'active',
      };
      cityStoreState.addEvent(normalizedEvt);
    }
  } catch (err) {
    // Fail-safe silently if store format differs
  }
};

interface CitizenReportState {
  reports: CitizenReport[];
  selectedReport: CitizenReport | null;
  filterCategory: ReportCategory | 'all';
  filterStatus: ReportStatus | 'all';
  searchQuery: string;
  
  // Actions
  addReport: (report: Omit<CitizenReport, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'status'>) => CitizenReport;
  updateReportStatus: (id: string, status: ReportStatus) => void;
  upvoteReport: (id: string) => void;
  setSelectedReport: (report: CitizenReport | null) => void;
  setFilterCategory: (cat: ReportCategory | 'all') => void;
  setFilterStatus: (status: ReportStatus | 'all') => void;
  setSearchQuery: (query: string) => void;
}

export const useCitizenReportStore = create<CitizenReportState>((set, get) => ({
  reports: loadReports(),
  selectedReport: null,
  filterCategory: 'all',
  filterStatus: 'all',
  searchQuery: '',

  addReport: (data) => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const now = new Date().toISOString();
    const newReport: CitizenReport = {
      ...data,
      id: `REP-2026-${randomNum}`,
      status: 'submitted',
      createdAt: now,
      updatedAt: now,
      upvotes: 1,
    };

    const updated = [newReport, ...get().reports];
    saveReports(updated);
    set({ reports: updated, selectedReport: newReport });
    syncReportToCityEvents(newReport);
    return newReport;
  },

  updateReportStatus: (id, status) => {
    const now = new Date().toISOString();
    const updated = get().reports.map((r) =>
      r.id === id ? { ...r, status, updatedAt: now } : r
    );
    saveReports(updated);
    const currentSelected = get().selectedReport;
    const nextSelected = currentSelected && currentSelected.id === id ? { ...currentSelected, status, updatedAt: now } : currentSelected;
    set({ reports: updated, selectedReport: nextSelected });

    const target = updated.find((r) => r.id === id);
    if (target) syncReportToCityEvents(target);
  },

  upvoteReport: (id) => {
    const updated = get().reports.map((r) =>
      r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r
    );
    saveReports(updated);
    const currentSelected = get().selectedReport;
    const nextSelected = currentSelected && currentSelected.id === id ? { ...currentSelected, upvotes: currentSelected.upvotes + 1 } : currentSelected;
    set({ reports: updated, selectedReport: nextSelected });
  },

  setSelectedReport: (selectedReport) => set({ selectedReport }),
  setFilterCategory: (filterCategory) => set({ filterCategory }),
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
