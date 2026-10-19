'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { BACKEND_ROADMAP_V2_SCHEMA } from '../data/backendRoadmapSchema';
import { buildRoadmapFromSchema } from '../utils/autoLayoutEngine';
import { normalizeDrawioJsonToV2 } from '../utils/drawioNormalizer';
import { RoadmapNode, TopicStatus } from '../types/roadmap';
import RoadmapSvgCanvas from './RoadmapSvgCanvas';
import TopicResourceDrawer from './TopicResourceDrawer';

const STORAGE_KEY = 'roadmapxpress_backend_v2_progress';

export default function RoadmapV2Container({
  legacyDrawioJson,
}: {
  legacyDrawioJson?: any;
}) {
  const [sourceMode, setSourceMode] = useState<'schema' | 'drawio'>('schema');
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [topicStatuses, setTopicStatuses] = useState<
    Record<string, TopicStatus>
  >({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setTopicStatuses(JSON.parse(saved));
    } catch (e) {
      console.error('Failed to load roadmap progress', e);
    }
  }, []);

  const updateStatus = (label: string, status: TopicStatus) => {
    setTopicStatuses((prev) => {
      const next = { ...prev, [label]: status };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) { }
      return next;
    });
  };

  const handleToggleDone = (node: RoadmapNode) => {
    const current = topicStatuses[node.label] || 'pending';
    updateStatus(node.label, current === 'done' ? 'pending' : 'done');
  };

  const graph = useMemo(() => {
    if (sourceMode === 'drawio' && legacyDrawioJson) {
      return normalizeDrawioJsonToV2(legacyDrawioJson);
    }
    return buildRoadmapFromSchema('Backend Roadmap', BACKEND_ROADMAP_V2_SCHEMA);
  }, [sourceMode, legacyDrawioJson]);

  const { totalTopics, completedCount, percent } = useMemo(() => {
    const uniqueTopics = new Set(
      graph.nodes.filter((n) => n.clickable).map((n) => n.label)
    );
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
  }, [graph.nodes, topicStatuses]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <div className="">

        <div className="flex items-center gap-4">


          {legacyDrawioJson && (
            <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50 text-xs font-medium">
              <button
                onClick={() => setSourceMode('schema')}
                className={
                  'px-3 py-1.5 rounded-md transition-colors ' +
                  (sourceMode === 'schema'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900')
                }
              >
                Auto-Layout Schema
              </button>
              <button
                onClick={() => setSourceMode('drawio')}
                className={
                  'px-3 py-1.5 rounded-md transition-colors ' +
                  (sourceMode === 'drawio'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900')
                }
              >
                Patched Draw.io JSON
              </button>
            </div>
          )}
        </div>
      </div>

      <RoadmapSvgCanvas
        graph={graph}
        topicStatuses={topicStatuses}
        onSelectTopic={(node) => setSelectedNode(node)}
        onToggleTopicDone={handleToggleDone}
      />

      <TopicResourceDrawer
        node={selectedNode}
        status={
          selectedNode
            ? topicStatuses[selectedNode.label] || 'pending'
            : 'pending'
        }
        onClose={() => setSelectedNode(null)}
        onChangeStatus={updateStatus}
      />
    </main>
  );
}
