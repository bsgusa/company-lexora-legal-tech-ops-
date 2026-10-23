/**
 * Lexora AI - TypeScript Types
 * Generated from Supabase schema
 */

// Base types
export type UUID = string;
export type Timestamp = string;
export type Json = Record<string, any>;

// Enums
export type ResumeStatus = 'draft' | 'primary' | 'archived';
export type ApplicationStatus = 
  | 'saved' 
  | 'tailoring' 
  | 'ready_to_apply' 
  | 'applied' 
  | 'screening' 
  | 'interviewing' 
  | 'offer' 
  | 'rejected' 
  | 'withdrawn';
export type ApplicationPriority = 'low' | 'medium' | 'high';
export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship';
export type InterviewType = 'phone' | 'video' | 'onsite' | 'technical' | 'behavioral' | 'case_study';
export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show';
export type InterviewOutcome = 'pass' | 'fail' | 'pending' | 'next_round';
export type MatchSource = 'linkedin' | 'indeed' | 'glassdoor' | 'company_site' | 'referral' | 'other';
export type RemotePreference = 'remote_only' | 'hybrid' | 'onsite' | 'any';
export type VisaStatus = 'citizen' | 'green_card' | 'h1b' | 'f1_opt' | 'f1_cpt' | 'l1' | 'tn' | 'other' | 'needs_sponsorship';
export type PeriodType = 'daily' | 'weekly' | 'monthly';

// Core entities
export interface Profile {
  id: UUID;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  country: string | null;
  timezone: string;
  user_type: 'all' | 'f1' | 'h1b' | 'citizen' | 'client';
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Resume {
  id: UUID;
  user_id: UUID;
  title: string;
  original_file_url: string | null;
  original_file_name: string | null;
  parsed_content: ParsedResumeContent;
  tailored_versions: TailoredResumeVersion[];
  current_version: number;
  is_primary: boolean;
  ats_score: number | null;
  skills: ResumeSkills;
  experience_years: number | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ParsedResumeContent {
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: ResumeSkills;
  projects: Project[];
  rawText: string;
}

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
}

export interface Experience {
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  location: string;
  graduationDate: string;
  gpa: string;
}

export interface ResumeSkills {
  technical: string[];
  soft: string[];
  languages: string[];
  certifications: string[];
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  url: string;
}

export interface TailoredResumeVersion {
  version: number;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  summary: string;
  experience: TailoredExperience[];
  skills: ResumeSkills;
  keywordsMatched: string[];
  keywordsMissing: string[];
  atsOptimizationNotes: string[];
  createdAt: Timestamp;
}

export interface TailoredExperience extends Experience {
  highlightedSkills: string[];
}

export interface JobApplication {
  id: UUID;
  user_id: UUID;
  resume_id: UUID | null;
  cover_letter_id: UUID | null;
  job_title: string;
  company_name: string;
  company_domain: string | null;
  job_description: string | null;
  job_url: string | null;
  job_source: string | null;
  job_location: string | null;
  job_type: JobType | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  status: ApplicationStatus;
  priority: ApplicationPriority;
  applied_at: Timestamp | null;
  response_at: Timestamp | null;
  next_action: string | null;
  next_action_due: Timestamp | null;
  notes: string | null;
  metadata: Json;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface JobMatch {
  id: UUID;
  user_id: UUID;
  job_title: string;
  company_name: string;
  company_domain: string | null;
  job_description: string;
  job_url: string;
  job_location: string | null;
  job_type: JobType | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  match_score: number;
  match_reasons: string[];
  required_skills: string[];
  preferred_skills: string[];
  source: MatchSource;
  source_job_id: string;
  is_saved: boolean;
  is_applied: boolean;
  applied_application_id: UUID | null;
  expires_at: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface CoverLetter {
  id: UUID;
  user_id: UUID;
  resume_id: UUID | null;
  job_application_id: UUID | null;
  job_title: string;
  company_name: string;
  job_description: string | null;
  generated_content: string;
  prompt_used: string | null;
  model_version: string;
  tokens_used: number | null;
  ats_score: number | null;
  is_sent: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface InterviewSession {
  id: UUID;
  user_id: UUID;
  job_application_id: UUID;
  interview_type: InterviewType;
  scheduled_at: Timestamp;
  duration_minutes: number;
  interviewer_names: string[];
  interviewer_emails: string[];
  meeting_link: string | null;
  meeting_id: string | null;
  status: InterviewStatus;
  prep_materials: InterviewPrepMaterials | null;
  questions_practiced: PracticedQuestion[];
  feedback: string | null;
  outcome: InterviewOutcome | null;
  notes: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface InterviewPrepMaterials {
  companyResearch: CompanyResearch;
  roleInsights: RoleInsights;
  predictedQuestions: PredictedQuestion[];
  technicalTopics: string[];
  behavioralThemes: string[];
  questionsToAsk: string[];
  salaryNegotiation: SalaryNegotiation;
  checklist: string[];
}

export interface CompanyResearch {
  overview: string;
  mission: string;
  values: string[];
  recentNews: string[];
  products: string[];
  competitors: string[];
  culture: string;
}

export interface RoleInsights {
  keyResponsibilities: string[];
  requiredSkills: string[];
  teamStructure: string;
  challenges: string[];
  successMetrics: string[];
}

export interface PredictedQuestion {
  category: string;
  question: string;
  whyAsked: string;
  strongAnswerFramework: string;
  sampleAnswer: string;
}

export interface SalaryNegotiation {
  marketRange: { min: number; max: number };
  negotiationTips: string[];
}

export interface PracticedQuestion {
  question: string;
  answer: string;
  practicedAt: Timestamp;
  confidence: number; // 1-10
}

export interface ApplicationAnalytics {
  id: UUID;
  user_id: UUID;
  period_start: string;
  period_end: string;
  period_type: PeriodType;
  applications_sent: number;
  responses_received: number;
  interviews_scheduled: number;
  offers_received: number;
  rejections_received: number;
  avg_match_score: number | null;
  avg_ats_score: number | null;
  top_job_titles: TopItem[];
  top_companies: TopItem[];
  top_sources: TopItem[];
  funnel_data: FunnelData;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface TopItem {
  title?: string;
  company?: string;
  source?: string;
  count: number;
}

export interface FunnelData {
  saved: number;
  tailoring: number;
  ready_to_apply: number;
  applied: number;
  screening: number;
  interviewing: number;
  offer: number;
  rejected: number;
  withdrawn: number;
}

export interface UserPreferences {
  id: UUID;
  user_id: UUID;
  desired_titles: string[];
  desired_locations: string[];
  remote_preference: RemotePreference;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  visa_status: VisaStatus | null;
  sponsorship_required: boolean;
  industries: string[];
  company_sizes: string[];
  excluded_companies: string[];
  excluded_keywords: string[];
  auto_apply_enabled: boolean;
  auto_apply_max_per_day: number;
  auto_apply_min_match_score: number;
  notification_email: boolean;
  notification_push: boolean;
  notification_sms: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ATSScore {
  id: UUID;
  user_id: UUID;
  resume_id: UUID;
  job_application_id: UUID | null;
  job_match_id: UUID | null;
  overall_score: number;
  keyword_match_score: number;
  format_score: number;
  section_completeness_score: number;
  skills_match_score: number;
  experience_match_score: number;
  education_match_score: number;
  missing_keywords: string[];
  suggestions: string[];
  created_at: Timestamp;
}

// API Request/Response types
export interface ParseResumeRequest {
  resumeId: UUID;
  fileUrl: string;
  fileName: string;
}

export interface TailorResumeRequest {
  resumeId: UUID;
  jobDescription: string;
  jobTitle: string;
  companyName: string;
}

export interface MatchJobsRequest {
  userId: UUID;
  resumeId?: UUID;
  preferences?: Partial<UserPreferences>;
  limit?: number;
}

export interface GenerateCoverLetterRequest {
  resumeId: UUID;
  jobApplicationId?: UUID;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  hiringManagerName?: string;
  customInstructions?: string;
}

export interface ScoreATSRequest {
  resumeId: UUID;
  jobApplicationId?: UUID;
  jobMatchId?: UUID;
  jobDescription?: string;
}

export interface InterviewPrepRequest {
  interviewId: UUID;
  jobApplicationId: UUID;
  interviewType: InterviewType;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
}

export interface AnalyticsRequest {
  userId: UUID;
  periodType: PeriodType;
  periodStart?: string;
}

// Dashboard aggregation types
export interface DashboardStats {
  applicationsSent: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
  avgMatchScore: number;
  avgAtsScore: number;
  activeApplications: number;
  upcomingInterviews: number;
}

export interface ActivityFeedItem {
  id: UUID;
  type: 'application_created' | 'application_submitted' | 'interview_scheduled' | 'interview_completed' | 'offer_received' | 'rejection_received' | 'match_found' | 'resume_tailored';
  title: string;
  description: string;
  timestamp: Timestamp;
  metadata: Json;
}

// Utility types
export type CreateResume = Omit<Resume, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'current_version' | 'tailored_versions' | 'ats_score'>;
export type UpdateResume = Partial<CreateResume>;
export type CreateJobApplication = Omit<JobApplication, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'applied_at' | 'response_at'>;
export type UpdateJobApplication = Partial<CreateJobApplication>;
export type CreateJobMatch = Omit<JobMatch, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_saved' | 'is_applied' | 'applied_application_id'>;
export type CreateCoverLetter = Omit<CoverLetter, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'tokens_used' | 'ats_score' | 'is_sent'>;
export type CreateInterviewSession = Omit<InterviewSession, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'prep_materials' | 'questions_practiced' | 'feedback' | 'outcome'>;
export type CreateUserPreferences = Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>;