/**
 * Lexora AI - Supabase Edge Functions Client
 * Type-safe API client for all backend functions
 */

import { createClient } from '@supabase/supabase-js';
import type {
  ParseResumeRequest,
  TailorResumeRequest,
  MatchJobsRequest,
  GenerateCoverLetterRequest,
  ScoreATSRequest,
  InterviewPrepRequest,
  AnalyticsRequest,
  Resume,
  JobApplication,
  JobMatch,
  CoverLetter,
  InterviewSession,
  ApplicationAnalytics,
  UserPreferences,
  ATSScore,
  TailoredResumeVersion,
  InterviewPrepMaterials,
} from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create browser client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const getAccessToken = async () => {
  const session = await getSession();
  return session?.access_token;
};

// Generic function caller
async function callFunction<T>(functionName: string, payload: any): Promise<T> {
  const token = await getAccessToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Function ${functionName} failed`);
  }

  return response.json();
}

// Resume functions
export const resumeApi = {
  // Parse uploaded resume file
  async parse(request: ParseResumeRequest) {
    return callFunction<{ success: boolean; parsed: any }>('parse-resume', request);
  },

  // Tailor resume for specific job
  async tailor(request: TailorResumeRequest) {
    return callFunction<{ success: boolean; tailored: TailoredResumeVersion }>('tailor-resume', request);
  },

  // Get all resumes for user
  async list() {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Resume[];
  },

  // Get single resume
  async get(id: string) {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Resume;
  },

  // Create new resume
  async create(resume: Omit<Resume, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'current_version' | 'tailored_versions' | 'ats_score'>) {
    const { data, error } = await supabase
      .from('resumes')
      .insert(resume)
      .select()
      .single();
    
    if (error) throw error;
    return data as Resume;
  },

  // Update resume
  async update(id: string, updates: Partial<Resume>) {
    const { data, error } = await supabase
      .from('resumes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Resume;
  },

  // Delete resume
  async delete(id: string) {
    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Set primary resume
  async setPrimary(id: string) {
    // First unset all others
    await supabase
      .from('resumes')
      .update({ is_primary: false })
      .eq('is_primary', true);
    
    // Then set this one
    return this.update(id, { is_primary: true });
  },
};

// Job Application functions
export const applicationApi = {
  // List all applications
  async list(filters?: { status?: string; limit?: number }) {
    let query = supabase
      .from('job_applications')
      .select(`
        *,
        resume:resumes(*),
        cover_letter:cover_letters(*)
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as (JobApplication & { resume: Resume | null; cover_letter: CoverLetter | null })[];
  },

  // Get single application
  async get(id: string) {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        resume:resumes(*),
        cover_letter:cover_letters(*),
        interviews:interview_sessions(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create application
  async create(app: Omit<JobApplication, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'applied_at' | 'response_at'>) {
    const { data, error } = await supabase
      .from('job_applications')
      .insert(app)
      .select()
      .single();
    
    if (error) throw error;
    return data as JobApplication;
  },

  // Update application
  async update(id: string, updates: Partial<JobApplication>) {
    const { data, error } = await supabase
      .from('job_applications')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as JobApplication;
  },

  // Delete application
  async delete(id: string) {
    const { error } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Update status with timestamp
  async updateStatus(id: string, status: JobApplication['status']) {
    const updates: Partial<JobApplication> = { status, updated_at: new Date().toISOString() };
    
    if (status === 'applied') {
      updates.applied_at = new Date().toISOString();
    } else if (['offer', 'rejected'].includes(status)) {
      updates.response_at = new Date().toISOString();
    }
    
    return this.update(id, updates);
  },
};

// Job Match functions
export const matchApi = {
  // Find job matches
  async find(request: MatchJobsRequest) {
    return callFunction<{ success: boolean; matches: JobMatch[] }>('match-jobs', request);
  },

  // List saved matches
  async listSaved() {
    const { data, error } = await supabase
      .from('job_matches')
      .select('*')
      .eq('is_saved', true)
      .order('match_score', { ascending: false });
    
    if (error) throw error;
    return data as JobMatch[];
  },

  // List all matches
  async list(filters?: { is_applied?: boolean; limit?: number }) {
    let query = supabase
      .from('job_matches')
      .select('*')
      .order('match_score', { ascending: false });

    if (filters?.is_applied !== undefined) {
      query = query.eq('is_applied', filters.is_applied);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as JobMatch[];
  },

  // Save/unsave match
  async toggleSave(id: string, isSaved: boolean) {
    const { data, error } = await supabase
      .from('job_matches')
      .update({ is_saved: isSaved, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as JobMatch;
  },

  // Mark as applied
  async markApplied(id: string, applicationId: string) {
    const { data, error } = await supabase
      .from('job_matches')
      .update({ is_applied: true, applied_application_id: applicationId, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as JobMatch;
  },
};

// Cover Letter functions
export const coverLetterApi = {
  // Generate cover letter
  async generate(request: GenerateCoverLetterRequest) {
    return callFunction<{ success: boolean; coverLetter: CoverLetter }>('generate-cover-letter', request);
  },

  // List cover letters
  async list() {
    const { data, error } = await supabase
      .from('cover_letters')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as CoverLetter[];
  },

  // Get single cover letter
  async get(id: string) {
    const { data, error } = await supabase
      .from('cover_letters')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as CoverLetter;
  },

  // Update cover letter
  async update(id: string, updates: Partial<CoverLetter>) {
    const { data, error } = await supabase
      .from('cover_letters')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as CoverLetter;
  },

  // Mark as sent
  async markSent(id: string) {
    return this.update(id, { is_sent: true });
  },
};

// Interview functions
export const interviewApi = {
  // Generate prep materials
  async generatePrep(request: InterviewPrepRequest) {
    return callFunction<{ success: boolean; prep: InterviewPrepMaterials }>('interview-prep', request);
  },

  // List interviews
  async list(filters?: { status?: InterviewSession['status']; upcoming?: boolean }) {
    let query = supabase
      .from('interview_sessions')
      .select(`
        *,
        job_application:job_applications(*)
      `)
      .order('scheduled_at', { ascending: true });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.upcoming) {
      query = query.gte('scheduled_at', new Date().toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as (InterviewSession & { job_application: JobApplication })[];
  },

  // Get single interview
  async get(id: string) {
    const { data, error } = await supabase
      .from('interview_sessions')
      .select(`
        *,
        job_application:job_applications(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create interview
  async create(interview: Omit<InterviewSession, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'prep_materials' | 'questions_practiced' | 'feedback' | 'outcome'>) {
    const { data, error } = await supabase
      .from('interview_sessions')
      .insert(interview)
      .select()
      .single();
    
    if (error) throw error;
    return data as InterviewSession;
  },

  // Update interview
  async update(id: string, updates: Partial<InterviewSession>) {
    const { data, error } = await supabase
      .from('interview_sessions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as InterviewSession;
  },

  // Add practiced question
  async addPracticedQuestion(id: string, question: string, answer: string, confidence: number) {
    const interview = await this.get(id);
    const practiced = interview.questions_practiced || [];
    practiced.push({
      question,
      answer,
      practicedAt: new Date().toISOString(),
      confidence,
    });
    
    return this.update(id, { questions_practiced: practiced });
  },

  // Complete interview
  async complete(id: string, outcome: InterviewSession['outcome'], feedback?: string) {
    return this.update(id, { 
      status: 'completed', 
      outcome, 
      feedback,
      updated_at: new Date().toISOString() 
    });
  },
};

// ATS Scoring functions
export const atsApi = {
  // Score resume against job
  async score(request: ScoreATSRequest) {
    return callFunction<{ success: boolean; score: ATSScore }>('score-ats', request);
  },

  // Get scores for resume
  async getForResume(resumeId: string) {
    const { data, error } = await supabase
      .from('ats_scores')
      .select('*')
      .eq('resume_id', resumeId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as ATSScore[];
  },

  // Get latest score for resume
  async getLatest(resumeId: string) {
    const { data, error } = await supabase
      .from('ats_scores')
      .select('*')
      .eq('resume_id', resumeId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data as ATSScore | null;
  },
};

// Analytics functions
export const analyticsApi = {
  // Generate analytics for period
  async generate(request: AnalyticsRequest) {
    return callFunction<{ success: boolean; analytics: ApplicationAnalytics }>('analytics-aggregator', request);
  },

  // Get analytics history
  async getHistory(periodType: 'daily' | 'weekly' | 'monthly', limit = 12) {
    const { data, error } = await supabase
      .from('application_analytics')
      .select('*')
      .eq('period_type', periodType)
      .order('period_start', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data as ApplicationAnalytics[];
  },

  // Get latest analytics
  async getLatest(periodType: 'daily' | 'weekly' | 'monthly') {
    const { data, error } = await supabase
      .from('application_analytics')
      .select('*')
      .eq('period_type', periodType)
      .order('period_start', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data as ApplicationAnalytics | null;
  },

  // Get dashboard stats (computed from recent data)
  async getDashboardStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const [{ count: totalApps }, { count: appliedApps }, { count: interviews }, { count: offers }, { data: recentMatches }, { data: recentScores }] = await Promise.all([
      supabase.from('job_applications').select('*', { count: 'exact', head: true }).eq('user_id', (await supabase.auth.getUser()).data.user?.id),
      supabase.from('job_applications').select('*', { count: 'exact', head: true }).eq('status', 'applied').eq('user_id', (await supabase.auth.getUser()).data.user?.id),
      supabase.from('interview_sessions').select('*', { count: 'exact', head: true }).eq('user_id', (await supabase.auth.getUser()).data.user?.id).gte('scheduled_at', now.toISOString()),
      supabase.from('job_applications').select('*', { count: 'exact', head: true }).eq('status', 'offer').eq('user_id', (await supabase.auth.getUser()).data.user?.id),
      supabase.from('job_matches').select('match_score').eq('user_id', (await supabase.auth.getUser()).data.user?.id).gte('created_at', thirtyDaysAgo.toISOString()),
      supabase.from('ats_scores').select('overall_score').eq('user_id', (await supabase.auth.getUser()).data.user?.id).gte('created_at', thirtyDaysAgo.toISOString()),
    ]);

    const avgMatchScore = recentMatches && recentMatches.length > 0
      ? recentMatches.reduce((sum, m) => sum + (m.match_score || 0), 0) / recentMatches.length
      : 0;

    const avgAtsScore = recentScores && recentScores.length > 0
      ? recentScores.reduce((sum, s) => sum + (s.overall_score || 0), 0) / recentScores.length
      : 0;

    return {
      applicationsSent: appliedApps || 0,
      responseRate: totalApps && appliedApps ? (appliedApps / totalApps) * 100 : 0,
      interviewRate: appliedApps && interviews ? (interviews / appliedApps) * 100 : 0,
      offerRate: appliedApps && offers ? (offers / appliedApps) * 100 : 0,
      avgMatchScore: Math.round(avgMatchScore * 100) / 100,
      avgAtsScore: Math.round(avgAtsScore * 100) / 100,
      activeApplications: totalApps ? totalApps - (offers || 0) - (await supabase.from('job_applications').select('*', { count: 'exact', head: true }).eq('status', 'rejected').eq('user_id', (await supabase.auth.getUser()).data.user?.id)).count! : 0,
      upcomingInterviews: interviews || 0,
    };
  },
};

// User Preferences functions
export const preferencesApi = {
  // Get preferences
  async get() {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data as UserPreferences | null;
  },

  // Update preferences
  async update(prefs: Partial<UserPreferences>) {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({ ...prefs, updated_at: new Date().toISOString() })
      .select()
      .single();
    
    if (error) throw error;
    return data as UserPreferences;
  },
};

// File upload helpers
export const storageApi = {
  // Upload resume file
  async uploadResume(file: File, userId: string) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(data.path);
    
    return { path: data.path, publicUrl };
  },

  // Delete resume file
  async deleteResume(path: string) {
    const { error } = await supabase.storage
      .from('resumes')
      .remove([path]);
    
    if (error) throw error;
  },
};

// Realtime subscriptions
export const realtime = {
  // Subscribe to application changes
  onApplicationChange(callback: (payload: any) => void) {
    return supabase
      .channel('job_applications_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_applications' }, callback)
      .subscribe();
  },

  // Subscribe to interview changes
  onInterviewChange(callback: (payload: any) => void) {
    return supabase
      .channel('interview_sessions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'interview_sessions' }, callback)
      .subscribe();
  },

  // Subscribe to match changes
  onMatchChange(callback: (payload: any) => void) {
    return supabase
      .channel('job_matches_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_matches' }, callback)
      .subscribe();
  },

  // Unsubscribe
  unsubscribe(channel: any) {
    supabase.removeChannel(channel);
  },
};