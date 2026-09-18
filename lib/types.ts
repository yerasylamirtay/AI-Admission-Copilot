/* ============================================================
   AdmitPath — Core Type Definitions (7-Step Flow)
   ============================================================ */

export type Region = "kazakhstan" | "europe" | "asia" | "usa";
export type BudgetTier = "grant" | "5k" | "15k" | "25k+";
export type Priority = "prestige" | "career" | "city" | "cost";

export interface ExamDetail {
  score?: number | null;
  date?: string | null;
  taken: boolean;
}

export interface ExamRecords {
  ielts?: ExamDetail;
  sat?: ExamDetail;
  ent?: ExamDetail;
  toefl?: ExamDetail;
  duolingo?: ExamDetail;
  [key: string]: ExamDetail | undefined;
}

export interface Profile {
  grade?: number;
  interests?: string[];
  gpa?: number;
  gpaScale?: "4.0" | "5.0";
  languages?: string[];
  exams?: ExamRecords;
  countries?: string[];
  budget?: string; // e.g. "grant", "5000", "15000", "25000+"
  timeline?: string; // e.g. "2025", "2026", "через год"
  constraints?: string; // e.g. "только Европа, нужен грант"
  // Legacy / helper aliases:
  regions?: Region[];
  specialties?: string[];
  priorities?: Priority[];
  ielts?: number | null;
  sat?: number | null;
  ent?: number | null;
  schoolType?: string;
  olympiads?: { name: string; level: string }[];
}

export interface Factor {
  name: string;
  label: string;
  score: number;
  weight: number;
  detail: string;
}

export type ReadinessTier = "high" | "medium" | "low";

export interface DiagnoseResult {
  readinessIndex: number;
  factors: Factor[];
  tier: ReadinessTier;
  summary?: string;
  strengths?: string[];
  constraints?: string[];
  goal?: string;
}

export type UniversityTier = "dream" | "target" | "safety";

export interface University {
  id: string;
  name: string;
  city: string;
  address: string;
  country: string;
  region: Region;
  tuition: number;
  scholarships: string;
  gpaReq: number;
  ieltsReq: number | null;
  satReq: number | null;
  entReq: number | null;
  deadline: string;
  programs: string[];
  acceptanceRate: number;
  ranking: number;
  description: string;
  housing: { available: boolean; costPerMonth: number; description: string };
}

export interface RecommendedUniversity extends University {
  tier: UniversityTier;
  matchScore: number;
  explanation?: string;
}

export interface RecommendResult {
  dream: RecommendedUniversity[];
  target: RecommendedUniversity[];
  safety: RecommendedUniversity[];
}

export type RoadmapCategory = "exams" | "documents" | "essays" | "recommendation_letters" | "submission";

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  category: RoadmapCategory;
  resources: string[];
  deadline: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
}

export interface RoadmapResult {
  items: RoadmapItem[];
  weeklyPriority?: {
    title: string;
    description: string;
  };
}

// ── Essay Draft ──
export interface EssayAnswers {
  hook: string;
  journey: string;
  whyUs: string;
  futureImpact: string;
}

export interface EssayDraftResult {
  draft: string;
  wordCount: number;
  suggestions: string[];
}

export interface UserStreak {
  currentStreak: number;
  lastVisitDate: string;
  targetUniversityId?: string;
  targetUniversityName?: string;
  targetProgram?: string;
}
