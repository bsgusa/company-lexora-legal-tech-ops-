"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Briefcase, FileText, Calendar, TrendingUp, Target, Zap,
  ArrowRight, Plus, Filter, Download, Upload, Search, Settings,
  ChevronDown, ChevronUp, Eye, Edit, Trash2, Star, Clock,
  Building2, MapPin, DollarSign, Award, Activity, BarChart3
} from "lucide-react";
import DashboardStats from "@/components/dashboard/DashboardStats";
import ApplicationPipeline from "@/components/dashboard/ApplicationPipeline";
import UpcomingInterviews from "@/components/dashboard/UpcomingInterviews";
import JobMatches from "@/components/dashboard/JobMatches";
import QuickActions from "@/components/dashboard/QuickActions";
import ResumeManager from "@/components/dashboard/ResumeManager";

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'matches' | 'interviews' | 'resumes'>('overview');

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }
      setUser(session.user);
      setLoading(false);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/auth/login');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07040f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-400 rounded-full animate-spin" />
          <p className="text-purple-200/60">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'applications', label: 'Applications', icon: Briefcase, count: 0 },
    { id: 'matches', label: 'Job Matches', icon: Target, count: 0 },
    { id: 'interviews', label: 'Interviews', icon: Calendar, count: 0 },
    { id: 'resumes', label: 'Resumes', icon: FileText, count: 0 },
  ];

  return (
    <div className="min-h-screen bg-[#07040f] text-white">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute inset-0 spotlight" />

      {/* Header */}
      <header className="relative z-10 glass border-b border-violet-500/10 sticky top-0 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Navigation */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-white">Lexora</span>
              </div>
              
              <nav className="hidden md:flex items-center gap-1 bg-[#0d0820] rounded-xl p-1 border border-violet-500/10">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                        : 'text-purple-200/60 hover:text-white hover:bg-violet-500/10'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 text-xs flex items-center justify-center">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              <button className="glass px-4 py-2 rounded-xl text-sm font-medium text-purple-200 hover:text-white hover:border-violet-400/30 transition-all border border-violet-500/10">
                <Settings className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-3 px-3 py-1.5 glass rounded-full border border-violet-500/10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center font-semibold text-sm">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-white hidden sm:block">{user.email}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {activeTab === 'overview' && <OverviewTab userId={user.id} />}
          {activeTab === 'applications' && <ApplicationsTab userId={user.id} />}
          {activeTab === 'matches' && <MatchesTab userId={user.id} />}
          {activeTab === 'interviews' && <InterviewsTab userId={user.id} />}
          {activeTab === 'resumes' && <ResumesTab userId={user.id} />}
        </motion.div>
      </main>
    </div>
  );
}

// Tab Components
function OverviewTab({ userId }: { userId: string }) {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white/95 tracking-tight">
            Welcome back, <span className="gradient-text">Job Seeker</span>
          </h1>
          <p className="text-purple-200/60 mt-1">Here's your job search progress at a glance</p>
        </div>
        <div className="flex gap-3">
          <QuickActions userId={userId} />
        </div>
      </motion.div>

      {/* Stats Grid */}
      <DashboardStats userId={userId} />

      {/* Pipeline & Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ApplicationPipeline userId={userId} />
        <UpcomingInterviews userId={userId} />
      </div>

      {/* Quick Matches */}
      <JobMatches userId={userId} limit={5} />
    </div>
  );
}

function ApplicationsTab({ userId }: { userId: string }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white/95 tracking-tight">Applications</h1>
          <p className="text-purple-200/60 mt-1">Track and manage all your job applications</p>
        </div>
        <QuickActions userId={userId} />
      </div>
      <ApplicationPipeline userId={userId} fullView />
    </div>
  );
}

function MatchesTab({ userId }: { userId: string }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white/95 tracking-tight">Job Matches</h1>
          <p className="text-purple-200/60 mt-1">AI-matched opportunities tailored to your profile</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-sm font-medium text-violet-300 border border-violet-500/20 hover:border-violet-400/40 transition-all">
            <Zap className="w-4 h-4" />
            Find Matches
          </button>
        </div>
      </div>
      <JobMatches userId={userId} fullView />
    </div>
  );
}

function InterviewsTab({ userId }: { userId: string }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white/95 tracking-tight">Interviews</h1>
          <p className="text-purple-200/60 mt-1">Prepare for and track your upcoming interviews</p>
        </div>
      </div>
      <UpcomingInterviews userId={userId} fullView />
    </div>
  );
}

function ResumesTab({ userId }: { userId: string }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white/95 tracking-tight">Resumes</h1>
          <p className="text-purple-200/60 mt-1">Manage your resume versions and AI tailoring</p>
        </div>
      </div>
      <ResumeManager userId={userId} />
    </div>
  );
}