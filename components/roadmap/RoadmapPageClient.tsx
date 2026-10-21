'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { RoadmapHybridData } from '@/lib/supabase/types';
import { RoadmapNode, TopicStatus } from '@/types/roadmap';
import RoadmapSvgCanvas from './RoadmapSvgCanvas';
import TopicResourceDrawer from './TopicResourceDrawer';
import { useAuth } from '@/components/auth/auth-provider';
import { Sliders, Database, Settings } from 'lucide-react';

interface RoadmapPageClientProps {
  data: RoadmapHybridData;
}

export default function RoadmapPageClient({ data }: RoadmapPageClientProps) {
  const { isAdmin } = useAuth();
  const progressKey = 'roadmapxpress_progress_' + data.slug;

  const [topicStatuses, setTopicStatuses] = useState<Record<string, TopicStatus>>({});
  const [selectedTopic, setSelectedTopic] = useState<RoadmapNode | null>(null);

  // Load user progress from localStorage on mount
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(progressKey);
      if (savedProgress) {
        setTopicStatuses(JSON.parse(savedProgress));
      }
    } catch (e) {
      console.warn('Could not read user progress:', e);
    }
  }, [progressKey]);

  const updateTopicStatus = (label: string, status: TopicStatus) => {
    setTopicStatuses((prev) => {
      const next = { ...prev, [label]: status };
      try {
        localStorage.setItem(progressKey, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Calculate learning progress stats
  const { totalTopics, completedCount, percent } = useMemo(() => {
    const clickableNodes = data.graph.nodes.filter((n) => n.clickable && n.label);
    const uniqueTopics = new Set(clickableNodes.map((n) => n.label));
    const total = uniqueTopics.size;
    let done = 0;
    uniqueTopics.forEach((label) => {
      if (topicStatuses[label] === 'done') done += 1;
    });
    return {
      totalTopics: total,
      completedCount: done,
      percent: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  }, [data.graph.nodes, topicStatuses]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {/* HEADER CARD */}
      <div className="mb-6 p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Title, Subtitle, & Version Tags (No switcher pills!) */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              {data.title}
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
              {data.tag}
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-100 border border-slate-200">
              v{data.version}
            </span>
            {data.isDbSource && (
              <span
                className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-blue-700 bg-blue-50 border border-blue-200"
                title="Loaded live from Supabase Database"
              >
                <Database className="w-2.5 h-2.5" />
                <span>DB</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">{data.subtitle}</p>
        </div>

        {/* Right: Progress Tracker & Admin-only Editor button */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Learning Progress Bar */}
          <div className="w-44">
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>
                {completedCount} / {totalTopics} Done
              </span>
              <span>{percent}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: percent + '%' }}
              />
            </div>
          </div>

          {/* Admin-only Studio Editor Link */}
          {isAdmin && (
            <Link
              href={`/roadmap/${data.slug}/editor`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
              title="Only visible to Admins. Opens the Studio Editor in a new page."
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Studio Editor</span>
              <Settings className="w-3 h-3 text-amber-400" />
            </Link>
          )}
        </div>
      </div>

      {/* SVG Canvas (Pre-rendered server coordinates) */}
      <RoadmapSvgCanvas
        graph={data.graph}
        theme={data.theme}
        topicStatuses={topicStatuses}
        editMode={false}
        moveGroupWithSection={false}
        selectedNodeId={null}
        selectedEdgeId={null}
        onSelectTopic={(node) => setSelectedTopic(node)}
        onToggleTopicDone={(node) => {
          const cur = topicStatuses[node.label] || 'pending';
          updateTopicStatus(node.label, cur === 'done' ? 'pending' : 'done');
        }}
      />

      {/* Resource Drawer for clicked topics */}
      <TopicResourceDrawer
        roadmapTitle={data.title}
        node={selectedTopic}
        status={
          selectedTopic
            ? topicStatuses[selectedTopic.label] || 'pending'
            : 'pending'
        }
        onClose={() => setSelectedTopic(null)}
        onChangeStatus={updateTopicStatus}
      />
    </main>
  );
}
