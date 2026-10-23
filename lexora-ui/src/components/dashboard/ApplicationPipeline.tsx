"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Briefcase, Building2, MapPin, DollarSign, Calendar, Clock,
  ChevronRight, ChevronDown, Plus, Search, Filter, MoreVertical,
  Edit, Trash2, Eye, ArrowRight, Check, X, AlertCircle
} from "lucide-react";
import { JobApplication } from "@/lib/types";

interface ApplicationPipelineProps {
  userId: string;
  fullView?: boolean;
}

const pipelineStages = [
  { key: 'saved', label: 'Saved', color: 'from-slate-500 to-gray-600', icon: Briefcase },
  { key: 'tailoring', label: 'Tailoring', color: 'from-blue-500 to-indigo-600', icon: Clock },
  { key: 'ready_to_apply', label: 'Ready to Apply', color: 'from-violet-500 to-purple-600', icon: Check },
  { key: 'applied', label: 'Applied', color: 'from-cyan-500 to-blue-600', icon: ArrowRight },
  { key: 'screening', label: 'Screening', color: 'from-amber-500 to-orange-600', icon: AlertCircle },
  { key: 'interviewing', label: 'Interviewing', color: 'from-purple-500 to-pink-600', icon: Calendar },
  { key: 'offer', label: 'Offer', color: 'from-emerald-500 to-green-600', icon: Check },
  { key: 'rejected', label: 'Rejected', color: 'from-red-500 to-rose-600', icon: X },
  { key: 'withdrawn', label: 'Withdrawn', color: 'from-gray-500 to-slate-600', icon: X },
];

export default function ApplicationPipeline({ userId, fullView = false }: ApplicationPipelineProps) {
  const supabase = createClientComponentClient();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        let query = supabase
          .from('job_applications')
          .select(`
            *,
            resume:resumes(title),
            cover_letter:cover_letters(id)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!fullView) {
          query = query.limit(10);
        }

        const { data, error } = await query;
        if (error) throw error;
        setApplications(data || []);
      } catch (error) {
        console.error('Failed to fetch applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [userId, fullView, supabase]);

  // Group applications by status
  const groupedApps = pipelineStages.reduce((acc, stage) => {
    acc[stage.key] = applications.filter(app => app.status === stage.key);
    return acc;
  }, {} as Record<string, JobApplication[]>);

  // Filter applications
  const filteredApps = applications.filter(app => {
    const matchesStatus = filter === 'all' || app.status === filter;
    const matchesSearch = searchQuery === '' || 
      app.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (fullView) {
    return (
      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white/95">Application Pipeline</h2>
            <p className="text-purple-200/50 text-sm mt-1">{applications.length} total applications</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300/50" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass px-10 py-2 pr-4 rounded-xl text-sm text-white placeholder-purple-300/50 border border-violet-500/10 w-64 focus:border-violet-400/30 focus:outline-none"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="glass px-4 py-2 rounded-xl text-sm text-white border border-violet-500/10 bg-[#0a0618] focus:border-violet-400/30 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              {pipelineStages.map(s => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Pipeline View */}
        <div className="p-6 overflow-x-auto">
          <div className="flex gap-4 min-w-max" style={{ minWidth: '100%' }}>
            {pipelineStages.map((stage, stageIndex) => {
              const apps = groupedApps[stage.key] || [];
              const Icon = stage.icon;
              return (
                <motion.div
                  key={stage.key}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: stageIndex * 0.05, duration: 0.3 }}
                  className="flex flex-col w-72 flex-shrink-0"
                >
                  {/* Stage Header */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br ${stage.color}`}>
                      <Icon className="w-4 h-4 text-white" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{stage.label}</p>
                      <p className="text-xs text-purple-300/50">{apps.length} applications</p>
                    </div>
                  </div>

                  {/* Applications in stage */}
                  <div className="space-y-3 min-h-[200px]">
                    <AnimatePresence mode="popLayout">
                      {apps.map((app, appIndex) => (
                        <motion.div
                          key={app.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: appIndex * 0.03 }}
                          className="glass-card rounded-xl p-4 border border-white/5 hover:border-violet-500/20 transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-white truncate">{app.job_title}</h4>
                              <p className="text-sm text-purple-300/60 truncate">{app.company_name}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-purple-300/40">
                                {app.job_location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {app.job_location}
                                  </span>
                                )}
                                {app.salary_min && (
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    ${(app.salary_min / 1000).toFixed(0)}k - ${(app.salary_max || app.salary_min) / 1000}k
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-1.5 rounded-lg hover:bg-violet-500/20 text-purple-300/60 hover:text-white transition-colors" title="View">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 rounded-lg hover:bg-violet-500/20 text-purple-300/60 hover:text-white transition-colors" title="Edit">
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Status badge */}
                          <div className="mt-3 flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                              {stage.label}
                            </span>
                            {app.next_action_due && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Due: {new Date(app.next_action_due).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {apps.length === 0 && (
                      <div className="h-20 border-2 border-dashed border-violet-500/10 rounded-xl flex items-center justify-center">
                        <span className="text-purple-300/30 text-sm">Drop applications here</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Compact view for overview tab
  return (
    <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white/95">Application Pipeline</h2>
          <p className="text-purple-200/50 text-sm mt-0.5">{applications.length} total • {applications.filter(a => a.status === 'applied').length} sent</p>
        </div>
        <button className="text-sm text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1">
          View all
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {pipelineStages.slice(0, 5).map((stage, stageIndex) => {
            const apps = groupedApps[stage.key] || [];
            const Icon = stage.icon;
            return (
              <motion.div
                key={stage.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: stageIndex * 0.05 }}
                className="flex flex-col w-48 flex-shrink-0"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br ${stage.color}`}>
                    <Icon className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                  </div>
                  <span className="font-medium text-white text-sm">{stage.label}</span>
                  <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold">{apps.length}</span>
                </div>
                <div className="space-y-2">
                  {apps.slice(0, 3).map(app => (
                    <div key={app.id} className="glass-card rounded-lg p-3 border border-white/5 text-sm">
                      <p className="font-medium text-white truncate">{app.job_title}</p>
                      <p className="text-purple-300/50 truncate">{app.company_name}</p>
                    </div>
                  ))}
                  {apps.length > 3 && (
                    <div className="text-center py-2 text-purple-300/40 text-sm">
                      +{apps.length - 3} more
                    </div>
                  )}
                  {apps.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-violet-500/10 rounded-lg flex items-center justify-center">
                      <span className="text-purple-300/30 text-xs">Empty</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    saved: 'bg-slate-500/20 text-slate-300',
    tailoring: 'bg-blue-500/20 text-blue-300',
    ready_to_apply: 'bg-violet-500/20 text-violet-300',
    applied: 'bg-cyan-500/20 text-cyan-300',
    screening: 'bg-amber-500/20 text-amber-300',
    interviewing: 'bg-purple-500/20 text-purple-300',
    offer: 'bg-emerald-500/20 text-emerald-300',
    rejected: 'bg-red-500/20 text-red-300',
    withdrawn: 'bg-gray-500/20 text-gray-300',
  };
  return colors[status] || 'bg-slate-500/20 text-slate-300';
}