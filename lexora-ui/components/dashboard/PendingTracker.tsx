"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Clock, CheckCircle, Mail, Slack, LayoutDashboard } from "lucide-react";

interface PendingItem {
  id: string;
  source: string;
  title: string;
  body: string;
  status: string;
  score: number;
  impact: number;
  urgency: number;
  effort: number;
  action_type: string;
  action_target: string;
  draft: string;
  created_at: string;
}

const SOURCE_LABELS: Record<string, string> = {
  trading_ledger: "Trading",
  blofin_account: "BloFin Account",
  job_automation: "Job Automation",
  inbox_files: "Inbox",
  manual: "Manual",
};

const ACTION_ICONS: Record<string, any> = {
  email: Mail,
  slack: Slack,
  report: LayoutDashboard,
  commit: LayoutDashboard,
  trade: AlertTriangle,
  review: Clock,
  none: Clock,
};

export default function PendingTracker() {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reads the local pending.jsonl written by the AI Engineering Toolkit orchestrator.
    // In production this would hit a Supabase endpoint or your API.
    fetch("/api/pending")
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const openItems = items.filter((i) => i.status === "open").sort((a, b) => b.score - a.score);

  return (
    <section className="py-16 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              <LayoutDashboard className="mr-2 h-6 w-6 text-indigo-500" /> Pending Actions
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              AI-triaged items across your companies. Review before acting.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium dark:bg-indigo-900 dark:text-indigo-200">
            {openItems.length} open
          </span>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">Loading pending items…</p>
          </div>
        ) : openItems.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 text-center border border-gray-200 dark:border-gray-800">
            <CheckCircle className="mx-auto h-12 w-12 text-green-400 dark:text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">All caught up</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              No pending items. Run the orchestrator to scan for new actions.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="py-4 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                  <th className="py-4 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="py-4 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Source</th>
                  <th className="py-4 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                  <th className="py-4 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Draft</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {openItems.map((item) => {
                  const Icon = ACTION_ICONS[item.action_type] || Clock;
                  const sourceLabel = SOURCE_LABELS[item.source] || item.source;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-mono text-sm">
                        <span className={`font-bold ${item.score >= 5 ? "text-red-600" : item.score >= 3 ? "text-amber-600" : "text-green-600"} dark:text-red-400 dark:text-amber-400 dark:text-green-400`}>
                          {item.score.toFixed(2)}
                        </span>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          I{item.impact} × U{item.urgency} / E{item.effort + 1}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900 dark:text-white">{item.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.body.slice(0, 120)}…</div>
                        <div className="text-xs text-gray-400 mt-2">
                          {item.created_at.slice(0, 10)}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {sourceLabel}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                          <Icon className="h-3 w-3" />
                          {item.action_type}
                        </span>
                        {item.action_target && (
                          <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">{item.action_target}</div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <button
                          className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 underline"
                          onClick={() => navigator.clipboard.writeText(item.draft)}
                        >
                          Copy draft
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
