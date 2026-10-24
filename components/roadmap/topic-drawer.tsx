'use client';

import React, { useState } from 'react';
import { TopicStatus, TopicRequirementTag } from '@/types/roadmap';

export interface TopicDrawerData {
  id: string;
  topicId: string;
  label: string;
  subtext?: string[];
  tag?: TopicRequirementTag;
}

interface TopicDrawerProps {
  roadmapTitle: string;
  node: TopicDrawerData | null;
  status: TopicStatus;
  onClose: () => void;
  onChangeStatus: (target: TopicDrawerData | string, status: TopicStatus) => void;
  onChangeRequirementTag?: (topicId: string, tag: TopicRequirementTag) => void;
}

export default function TopicDrawer({
  roadmapTitle,
  node,
  status,
  onClose,
  onChangeStatus,
  onChangeRequirementTag,
}: TopicDrawerProps) {
  const [copiedId, setCopiedId] = useState(false);

  if (!node) return null;

  const topicSlugId = node.topicId || node.id;
  const encodedQuery = encodeURIComponent(`${node.label} ${roadmapTitle} guide`);

  const handleCopyId = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(topicSlugId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 1800);
    }
  };

  const setStatus = (targetStatus: TopicStatus) => {
    const next = status === targetStatus ? 'pending' : targetStatus;
    onChangeStatus(node, next);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs animate-in fade-in-0 duration-200"
      onClick={onClose}
    >
      <div
        id={`drawer-${topicSlugId}`}
        data-topic-id={topicSlugId}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto border-l border-slate-200 dark:border-slate-800"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 px-2.5 py-1 rounded-md">
              {roadmapTitle}
            </span>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm font-medium px-2 py-1 transition-colors"
            >
              ✕ Close
            </button>
          </div>

          {/* Topic Title */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-5">
            {node.label}
          </h2>


          {/* Subtext */}
          {node.subtext && node.subtext.length > 0 && (
            <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 font-mono">
              {node.subtext.join(' · ')}
            </div>
          )}

          {/* 3-State Learning Tracker */}
          <div className="mt-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Your Learning Status
            </label>
            <div className="inline-flex rounded-xl border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-xs w-full">
              <button
                type="button"
                onClick={() => setStatus('learning')}
                className={`flex-1 py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5 border-r border-slate-200 dark:border-slate-700 transition-colors ${status === 'learning' || status === 'in-progress'
                  ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200'
                  : 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
              >
                <span className="text-purple-600 dark:text-purple-400">📖</span> Learning
              </button>
              <button
                type="button"
                onClick={() => setStatus('done')}
                className={`flex-1 py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5 border-r border-slate-200 dark:border-slate-700 transition-colors ${status === 'done'
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200'
                  : 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
              >
                <span className="text-emerald-600 dark:text-emerald-400">✓</span> Done
              </button>
              <button
                type="button"
                onClick={() => setStatus('skipped')}
                className={`flex-1 py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${status === 'skipped'
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                  : 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
              >
                <span className="text-slate-500">✕</span> Skip
              </button>
            </div>
          </div>

          {/* Priority Tag Selector */}
          {onChangeRequirementTag && (
            <div className="mt-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Roadmap Priority Tag
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(
                  [
                    { id: 'required', label: '🟣 Required / Recommended' },
                    { id: 'pick-any', label: '🟢 Pick Any (Alternative)' },
                    { id: 'optional', label: '⚪ Optional / Anytime' },
                    { id: 'none', label: '✕ No Priority Badge' },
                  ] as const
                ).map((item) => {
                  const active = (node.tag || 'none') === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onChangeRequirementTag(topicSlugId, item.id)}
                      className={`py-2 px-3 rounded-lg font-semibold border text-left transition-all ${active
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Curated Deep Dive Links */}
          <div className="mt-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Resources for #{topicSlugId}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href={`https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(node.label)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    Official Documentation & Specs
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">↗</span>
                </a>
              </li>
              <li>
                <a
                  href={`https://www.youtube.com/results?search_query=${encodedQuery}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    Watch Video Crash Course
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">↗</span>
                </a>
              </li>
              <li>
                <a
                  href={`https://www.google.com/search?q=${encodedQuery}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    Deep-Dive Engineering Articles
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">↗</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
