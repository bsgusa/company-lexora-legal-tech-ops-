"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Calendar, Clock, Building2, Video, Monitor, Smartphone,
  ChevronRight, Check, X, AlertCircle, Brain, FileText,
  ArrowRight, Star, Play, Pause, Volume2, Mic
} from "lucide-react";
import { InterviewSession } from "@/lib/types";

interface UpcomingInterviewsProps {
  userId: string;
  fullView?: boolean;
}

const interviewTypeIcons: Record<string, any> = {
  phone: Smartphone,
  video: Video,
  onsite: Monitor,
  technical: Brain,
  behavioral: FileText,
  case_study: AlertCircle,
};

const interviewTypeLabels: Record<string, string> = {
  phone: 'Phone Screen',
  video: 'Video Call',
  onsite: 'On-site',
  technical: 'Technical',
  behavioral: 'Behavioral',
  case_study: 'Case Study',
};

const statusColors: Record<string, string> = {
  scheduled: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  cancelled: 'bg-red-500/20 text-red-300 border-red-500/30',
  rescheduled: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  no_show: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

export default function UpcomingInterviews({ userId, fullView = false }: UpcomingInterviewsProps) {
  const supabase = createClientComponentClient();
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        let query = supabase
          .from('interview_sessions')
          .select(`
            *,
            job_application:job_applications(job_title, company_name)
          `)
          .eq('user_id', userId)
          .order('scheduled_at', { ascending: true });

        if (!fullView) {
          const now = new Date().toISOString();
          query = query.gte('scheduled_at', now).limit(3);
        }

        const { data, error } = await query;
        if (error) throw error;
        setInterviews(data || []);
      } catch (error) {
        console.error('Failed to fetch interviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, [userId, fullView, supabase]);

  // Separate upcoming and past
  const now = new Date();
  const upcoming = interviews.filter(i => new Date(i.scheduled_at) >= now && i.status !== 'cancelled');
  const past = interviews.filter(i => new Date(i.scheduled_at) < now || i.status === 'cancelled');

  if (fullView) {
    return (
      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white/95">Interviews</h2>
            <p className="text-purple-200/50 text-sm mt-1">{upcoming.length} upcoming • {past.length} completed</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl text-sm font-semibold text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-shadow">
            <Calendar className="w-4 h-4" />
            Schedule Interview
          </button>
        </div>

        {upcoming.length > 0 && (
          <div className="p-6 border-b border-white/5">
            <h3 className="text-sm font-semibold text-purple-300/60 uppercase tracking-wider mb-4">Upcoming</h3>
            <div className="space-y-3">
              {upcoming.map((interview, index) => (
                <InterviewCard key={interview.id} interview={interview} index={index} />
              ))}
            </div>
          </div>
        )}

        {past.length > 0 && (
          <div className="p-6">
            <h3 className="text-sm font-semibold text-purple-300/60 uppercase tracking-wider mb-4">Past Interviews</h3>
            <div className="space-y-3">
              {past.slice(0, fullView ? 10 : 3).map((interview, index) => (
                <InterviewCard key={interview.id} interview={interview} index={index} isPast />
              ))}
            </div>
            {past.length > 10 && fullView && (
              <button className="w-full mt-4 py-2 glass rounded-xl text-sm font-medium text-purple-300/60 hover:text-white hover:border-violet-400/30 border border-violet-500/10 transition-all">
                Load {past.length - 10} more
              </button>
            )}
          </div>
        )}

        {interviews.length === 0 && (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 mx-auto text-purple-500/30 mb-4" />
            <p className="text-purple-200/50">No interviews scheduled yet</p>
            <p className="text-purple-300/30 text-sm mt-1">Apply to jobs to start getting interview requests</p>
          </div>
        )}
      </div>
    );
  }

  // Compact view
  return (
    <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white/95">Upcoming Interviews</h2>
          <p className="text-purple-200/50 text-sm mt-0.5">{upcoming.length} scheduled</p>
        </div>
      </div>

      <div className="p-6">
        {upcoming.length > 0 ? (
          <div className="space-y-3">
            {upcoming.map((interview, index) => (
              <CompactInterviewCard key={interview.id} interview={interview} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-8 h-8 mx-auto text-purple-500/30 mb-2" />
            <p className="text-purple-200/50 text-sm">No upcoming interviews</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InterviewCard({ interview, index, isPast = false }: { interview: InterviewSession; index: number; isPast?: boolean }) {
  const TypeIcon = interviewTypeIcons[interview.interview_type] || Calendar;
  const jobApp = interview.job_application as any;
  const isUpcoming = new Date(interview.scheduled_at) >= new Date() && interview.status !== 'cancelled';
  const daysUntil = isUpcoming 
    ? Math.ceil((new Date(interview.scheduled_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`glass-card rounded-xl p-4 border ${isPast ? 'border-white/5' : 'border-violet-500/10'}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Type Icon */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${getTypeGradient(interview.interview_type)}`}>
            <TypeIcon className="w-6 h-6 text-white" strokeWidth={2} />
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h4 className="font-semibold text-white">{jobApp?.job_title || 'Interview'}</h4>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[interview.status]}`}>
                {interview.status}
              </span>
              {daysUntil !== null && daysUntil <= 3 && daysUntil >= 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                </span>
              )}
            </div>
            
            <p className="text-purple-300/60 mt-1">{jobApp?.company_name || 'Company'}</p>
            
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-purple-300/50">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(interview.scheduled_at).toLocaleDateString('en-US', { 
                  weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(interview.scheduled_at).toLocaleTimeString('en-US', { 
                  hour: 'numeric', minute: '2-digit' 
                })}
              </span>
              <span className="flex items-center gap-1">
                <TypeIcon className="w-4 h-4" />
                {interviewTypeLabels[interview.interview_type]}
              </span>
              {interview.duration_minutes && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {interview.duration_minutes} min
                </span>
              )}
            </div>

            {interview.meeting_link && (
              <a 
                href={interview.meeting_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 text-sm text-violet-400 hover:text-violet-300 font-medium"
              >
                <ArrowRight className="w-4 h-4" />
                Join Meeting
              </a>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isUpcoming && interview.prep_materials && (
            <button className="px-3 py-1.5 glass rounded-lg text-sm font-medium text-violet-300 border border-violet-500/20 hover:border-violet-400/40 hover:text-white transition-all flex items-center gap-1">
              <Brain className="w-4 h-4" />
              Prep
            </button>
          )}
          {isUpcoming && interview.meeting_link && (
            <a 
              href={interview.meeting_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg text-sm font-medium text-white hover:shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-shadow flex items-center gap-1"
            >
              <Video className="w-4 h-4" />
              Join
            </a>
          )}
          {isPast && interview.outcome && (
            <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${interview.outcome === 'pass' ? 'bg-emerald-500/20 text-emerald-300' : interview.outcome === 'fail' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'}`}>
              {interview.outcome === 'pass' ? 'Passed' : interview.outcome === 'fail' ? 'Failed' : 'Pending'}
            </span>
          )}
        </div>
      </div>

      {/* Prep materials preview */}
      {interview.prep_materials && !isPast && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-sm text-purple-300/50 mb-2">
            <Brain className="w-4 h-4" />
            <span>Prep materials ready: {interview.prep_materials.predictedQuestions?.length || 0} questions, {interview.prep_materials.technicalTopics?.length || 0} topics</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function CompactInterviewCard({ interview, index }: { interview: InterviewSession; index: number }) {
  const TypeIcon = interviewTypeIcons[interview.interview_type] || Calendar;
  const jobApp = interview.job_application as any;
  const daysUntil = Math.ceil((new Date(interview.scheduled_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card rounded-xl p-4 border border-white/5 flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${getTypeGradient(interview.interview_type)}`}>
          <TypeIcon className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <div>
          <p className="font-medium text-white text-sm">{jobApp?.job_title || 'Interview'}</p>
          <p className="text-purple-300/50 text-xs">{jobApp?.company_name || 'Company'}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-purple-300/50 flex-shrink-0">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(interview.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(interview.scheduled_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </span>
        {daysUntil >= 0 && daysUntil <= 7 && (
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium">
            {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil}d`}
          </span>
        )}
      </div>
    </motion.div>
  );
}

function getTypeGradient(type: string): string {
  const gradients: Record<string, string> = {
    phone: 'from-green-500 to-emerald-600',
    video: 'from-blue-500 to-indigo-600',
    onsite: 'from-purple-500 to-violet-600',
    technical: 'from-orange-500 to-red-600',
    behavioral: 'from-cyan-500 to-teal-600',
    case_study: 'from-fuchsia-500 to-pink-600',
  };
  return gradients[type] || 'from-violet-500 to-indigo-600';
}