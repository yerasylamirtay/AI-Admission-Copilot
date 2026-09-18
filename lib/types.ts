/* ============================================================
   AdmitPath — Core Type Definitions
   All shared types for profile, diagnosis, universities, etc.
   ============================================================ */

// ── Profile (user input from onboarding) ──

export type GradeLevel = 9 | 10 | 11;
export type SchoolType = "general" | "nis" | "bil" | "lyceum" | "gymnasium" | "other";
export type GPAScale = "4.0" | "5.0";
export type Region = "kazakhstan" | "europe" | "asia" | "usa";
export type BudgetTier = "grant" | "5k" | "15k" | "25k+";
export type Priority = "prestige" | "career" | "city" | "cost";

export interface OlympiadEntry {
  name: string;
  level: "school" | "city" | "region" | "national" | "international";
}

export interface Profile {
  grade: GradeLevel;
  schoolType: SchoolType;
  gpa: number;
  gpaScale: GPAScale;
  ielts: number | null;
  sat: number | null;
  ent: number | null;
  olympiads: OlympiadEntry[];
  specialties: string[];
  regions: Region[];
  budget: BudgetTier;
  priorities: Priority[];
}

// ── Diagnosis Result ──

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
}

// ── University ──

export type UniversityTier = "dream" | "target" | "safety";

export interface University {
  id: string;
  name: string;
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
}

// ── Recommendations ──

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

// ── Roadmap ──

export type RoadmapCategory = "exams" | "documents" | "essays";

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  category: RoadmapCategory;
  deadline: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
}

export interface RoadmapResult {
  items: RoadmapItem[];
  weeklyPriority: {
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

// ── Teacher Letter Template ──

export interface TeacherLetterData {
  studentName: string;
  teacherName: string;
  subject: string;
  university: string;
}

// ── Preset Profiles for Jury ──

export interface PresetProfile {
  id: string;
  name: string;
  emoji: string;
  description: string;
  profile: Profile;
}

// ── Onboarding State ──

export interface OnboardingState {
  currentStep: number;
  profile: Partial<Profile>;
  diagnoseResult: DiagnoseResult | null;
  recommendations: RecommendResult | null;
  selectedForComparison: string[];
  roadmap: RoadmapResult | null;
  roadmapProgress: Record<string, boolean>;
  essayAnswers: Partial<EssayAnswers>;
}
