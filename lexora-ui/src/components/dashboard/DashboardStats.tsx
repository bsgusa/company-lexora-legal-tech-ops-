"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Briefcase, TrendingUp, Target, Award, ArrowUpRight, ArrowDownRight,
  Activity, BarChart3, Clock, CheckCircle, XCircle, AlertCircle
} from "lucide-react";

interface DashboardStatsProps {
  userId: string;
}

const statsConfig = [
  { key: 'applicationsSent', label: 'Applications Sent', icon: Briefcase, color: 'from-violet-500 to-purple-600', glow: 'rgba(139,92,246,0.3)' },
  { key: 'responseRate', label: 'Response Rate', icon: TrendingUp, color: 'from-indigo-500 to-blue-600', glow: 'rgba(99,102,241,0.3)', suffix: '%' },
  { key: 'interviewRate', label: 'Interview Rate', icon: Target, color: 'from-cyan-500 to-teal-600', glow: 'rgba(34,211,238,0.3)', suffix: '%' },
  { key: 'offerRate', label: 'Offer Rate', icon: Award, color: 'from-emerald-500 to-green-600', glow: 'rgba(16,185,129,0.3)', suffix: '%' },
  { key: 'avgMatchScore', label: 'Avg Match Score', icon: Activity, color: 'from-purple-500 to-pink-600', glow: 'rgba(168,85,247,0.3)' },
  { key: 'avgAtsScore', label: 'Avg ATS Score', icon: BarChart3, color: 'from-fuchsia-500 to-violet-600', glow: 'rgba(217,70,239,0.3)' },
];

export default function DashboardStats({ userId }: DashboardStatsProps) {
  const supabase = createClientComponentClient();
  const [stats, setStats] = useState<Record<string, number>>({
    applicationsSent: 0,
    responseRate: 0,
    interviewRate: 0,
    offerRate: 0,
    avgMatchScore: 0,
    avgAtsScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Fetch all needed data in parallel
        const [
          { count: totalApps },
          { count: appliedApps },
          { count: interviews },
          { count: offers },
          { count: rejections },
          { data: recentMatches },
          { data: recentScores },
        ] = await Promise.all([
          supabase.from('job_applications').select('*', { count: 'exact', head: true }).eq('user_id', userId),
          supabase.from('job_applications').select('*', { count: 'exact', head: true }).eq('status', 'applied').eq('user_id', userId),
          supabase.from('interview_sessions').select('*', { count: 'exact', head: true }).eq('user_id', userId).gte('scheduled_at', thirtyDaysAgo.toISOString()),
          supabase.from('job_applications').select('*', { count: 'exact', head: true }).eq('status', 'offer').eq('user_id', userId),
          supabase.from('job_applications').select('*', { count: 'exact', head: true }).eq('status', 'rejected').eq('user_id', userId),
          supabase.from('job_matches').select('match_score').eq('user_id', userId).gte('created_at', thirtyDaysAgo.toISOString()),
          supabase.from('ats_scores').select('overall_score').eq('user_id', userId).gte('created_at', thirtyDaysAgo.toISOString()),
        ]);

        const appsSent = appliedApps || 0;
        const total = totalApps || 0;
        const intCount = interviews || 0;
        const offCount = offers || 0;
        const rejCount = rejections || 0;
        const responded = intCount + offCount + rejCount;

        const avgMatch = recentMatches && recentMatches.length > 0
          ? recentMatches.reduce((sum, m) => sum + (m.match_score || 0), 0) / recentMatches.length
          : 0;

        const avgAts = recentScores && recentScores.length > 0
          ? recentScores.reduce((sum, s) => sum + (s.overall_score || 0), 0) / recentScores.length
          : 0;

        setStats({
          applicationsSent: appsSent,
          responseRate: total > 0 ? Math.round((responded / total) * 100) : 0,
          interviewRate: appsSent > 0 ? Math.round((intCount / appsSent) * 100) : 0,
          offerRate: appsSent > 0 ? Math.round((offCount / appsSent) * 100) : 0,
          avgMatchScore: Math.round(avgMatch),
          avgAtsScore: Math.round(avgAts),
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId, supabase]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsConfig.map((_, i) => (
          <motion.div key={i} className="glass-card rounded-2xl p-6 animate-pulse">
            <div className="h-4 bg-violet-500/10 rounded w-3/4 mb-4" />
            <div className="h-8 bg-violet-500/10 rounded w-1/2" />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {statsConfig.map((config, index) => {
        const value = stats[config.key] || 0;
        const Icon = config.icon;
        return (
          <motion.div
            key={config.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative group glass-card rounded-2xl p-6 border border-white/[0.06] hover:border-violet-500/20 transition-colors"
          >
            {/* Glow */}
            <div
              className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
              style={{ background: `radial-gradient(ellipse at center, ${config.glow} 0%, transparent 70%)` }}
            />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm text-purple-300/60 font-medium mb-2">{config.label}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white/95 bg-gradient-to-r {config.color} bg-clip-text text-transparent">
                    {value}
                  </span>
                  {config.suffix && <span className="text-xl font-bold text-purple-300/60">{config.suffix}</span>}
                </div>
              </div>

              <div className="w-12 h-12 rounded-xl bg-gradient-to-br {config.color} flex items-center justify-center shadow-lg"
                style={{ boxShadow: `0 8px 24px ${config.glow}` }}
              >
                <Icon className="w-6 h-6 text-white" strokeWidth={1.8} />
              </div>
            </div>

            {/* Trend indicator */}
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400/80">+12% vs last month</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}