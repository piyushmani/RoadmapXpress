'use client';

import React from 'react';
import { RoadmapNode, TopicStatus } from '@/types/roadmap';

interface TopicResourceDrawerProps {
  roadmapTitle: string;
  node: RoadmapNode | null;
  status: TopicStatus;
  onClose: () => void;
  onChangeStatus: (label: string, status: TopicStatus) => void;
}

export default function TopicResourceDrawer({
  roadmapTitle,
  node,
  status,
  onClose,
  onChangeStatus,
}: TopicResourceDrawerProps) {
  if (!node) return null;

  const encodedQuery = encodeURIComponent(
    node.label + ' ' + roadmapTitle + ' guide'
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
              {roadmapTitle}
            </span>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 text-sm font-medium px-2 py-1"
            >
              ✕ Close
            </button>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mt-5">
            {node.label}
          </h2>

          {node.subtext && node.subtext.length > 0 && (
            <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 font-mono">
              {node.subtext.join(' · ')}
            </div>
          )}

          <div className="mt-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Learning Progress
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'pending', label: 'Pending' },
                  { id: 'in-progress', label: 'In Progress' },
                  { id: 'done', label: 'Completed ✓' },
                  { id: 'skipped', label: 'Skip' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  onClick={() => onChangeStatus(node.label, item.id)}
                  className={
                    'py-2 px-3 rounded-lg text-sm font-medium border text-left transition-all ' +
                    (status === item.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50')
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Curated Learning Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href={
                    'https://developer.mozilla.org/en-US/search?q=' +
                    encodeURIComponent(node.label)
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-colors"
                >
                  <span className="font-medium text-slate-800">
                    MDN / Official Documentation
                  </span>
                  <span className="text-blue-600">↗</span>
                </a>
              </li>
              <li>
                <a
                  href={
                    'https://www.youtube.com/results?search_query=' +
                    encodedQuery
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-colors"
                >
                  <span className="font-medium text-slate-800">
                    Video Deep Dives on YouTube
                  </span>
                  <span className="text-blue-600">↗</span>
                </a>
              </li>
              <li>
                <a
                  href={'https://www.google.com/search?q=' + encodedQuery}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-colors"
                >
                  <span className="font-medium text-slate-800">
                    Articles & Architecture Guides
                  </span>
                  <span className="text-blue-600">↗</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p className="text-xs text-slate-400 pt-6 border-t border-slate-100">
          Tip: Right-click any topic node directly on the roadmap to toggle completion.
        </p>
      </div>
    </div>
  );
}
