'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RoadmapHybridData, RoadmapSummaryItem } from '@/lib/supabase/types';
import {
  RoadmapStageSchema,
  RoadmapLayoutOverrides,
  RoadmapNode,
  RoadmapThemeConfig,
  SemanticEdgeType,
  RoadmapEdge,
  TopicRequirementTag,
} from '@/types/roadmap';
import { buildRoadmapFromSchema } from '@/lib/autoLayoutEngine';
import { DEFAULT_ROADMAP_THEME } from '@/config/theme';
import RoadmapSvgCanvas from './RoadmapSvgCanvas';
import RoadmapStructureEditor from './RoadmapStructureEditor';
import { useAuth } from '@/components/auth/auth-provider';
import { fetchRoadmapForEditor } from '@/app/roadmap/editor/actions';
import {
  ArrowLeft,
  Save,
  ShieldAlert,
  Check,
  Database,
  ChevronDown,
  ChevronUp,
  Sliders,
  MapPin,
  ExternalLink,
  Compass,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { AuthModal } from '@/components/auth/auth-modal';

interface RoadmapEditorPageClientProps {
  availableRoadmaps?: RoadmapSummaryItem[];
  initialData?: RoadmapHybridData | null;
  allVersions?: Array<{ version: number; is_latest: boolean; updated_at?: string }>;
}

export default function RoadmapEditorPageClient({
  availableRoadmaps = [],
  initialData = null,
  allVersions = [],
}: RoadmapEditorPageClientProps) {
  const router = useRouter();
  const { user, isAdmin, isLoading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [currentRoadmapData, setCurrentRoadmapData] = useState<RoadmapHybridData | null>(
    initialData
  );
  const [activeSlug, setActiveSlug] = useState<string>(initialData?.slug || '');
  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState(false);

  const [stages, setStages] = useState<RoadmapStageSchema[]>(
    initialData?.stages || []
  );
  const [overrides, setOverrides] = useState<RoadmapLayoutOverrides>(
    initialData?.overrides || {
      nodeOffsets: {},
      edgePoints: {},
      customEdges: [],
      removedEdgeIds: [],
      topicTags: {},
    }
  );
  const [theme, setTheme] = useState<RoadmapThemeConfig>(
    initialData?.theme || DEFAULT_ROADMAP_THEME
  );

  const [currentVersion, setCurrentVersion] = useState<number>(
    initialData?.version || 1
  );
  const [versionsList, setVersionsList] = useState<
    Array<{ version: number; is_latest: boolean; updated_at?: string }>
  >(
    allVersions.length > 0
      ? allVersions
      : initialData
        ? [{ version: initialData.version, is_latest: true }]
        : []
  );

  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Dropdown Save Mode: 'new_version' (Save to DB) vs 'override_current' (Override Current)
  const [saveMode, setSaveMode] = useState<'new_version' | 'override_current'>('new_version');
  const [isSaveMenuOpen, setIsSaveMenuOpen] = useState(false);
  const saveDropdownRef = useRef<HTMLDivElement>(null);

  // Collapsible Structure & Theme Controls
  const [isControlsCollapsed, setIsControlsCollapsed] = useState(false);

  const [moveGroupWithSection, setMoveGroupWithSection] = useState(true);
  const [selectedEditNodeId, setSelectedEditNodeId] = useState<string | null>(null);
  const [selectedEditEdgeId, setSelectedEditEdgeId] = useState<string | null>(null);

  // Load Roadmap Data asynchronously without changing URL path
  const loadRoadmapData = async (slug: string, version?: number) => {
    if (!slug) {
      setCurrentRoadmapData(null);
      setActiveSlug('');
      setStages([]);
      setOverrides({
        nodeOffsets: {},
        edgePoints: {},
        customEdges: [],
        removedEdgeIds: [],
        topicTags: {},
      });
      setVersionsList([]);
      return;
    }

    setIsLoadingRoadmap(true);
    setSaveStatus(null);
    try {
      const res = await fetchRoadmapForEditor(slug, version);
      if (res.data) {
        setCurrentRoadmapData(res.data);
        setActiveSlug(res.data.slug);
        setStages(res.data.stages);
        setOverrides(res.data.overrides);
        setTheme(res.data.theme);
        setCurrentVersion(res.data.version);
        setVersionsList(
          res.allVersions.length > 0
            ? res.allVersions
            : [{ version: res.data.version, is_latest: true }]
        );
        setSelectedEditNodeId(null);
        setSelectedEditEdgeId(null);
      }
    } catch (err: any) {
      console.error('Failed to load roadmap:', err);
      setSaveStatus(`Failed to load: ${err.message}`);
    } finally {
      setIsLoadingRoadmap(false);
    }
  };

  // Check for auto-select from sessionStorage on mount (when clicked from a roadmap page)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const autoSelectSlug = sessionStorage.getItem('roadmapxpress_editor_auto_select');
    if (autoSelectSlug) {
      sessionStorage.removeItem('roadmapxpress_editor_auto_select');
      loadRoadmapData(autoSelectSlug);
    }
  }, []);

  // Close Save dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        saveDropdownRef.current &&
        !saveDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSaveMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute graph in real-time as admin tweaks settings
  const graph = useMemo(() => {
    if (!currentRoadmapData) {
      return { minX: 0, minY: 0, width: 800, height: 600, nodes: [], edges: [] };
    }
    return buildRoadmapFromSchema(currentRoadmapData.title, stages, overrides, theme);
  }, [currentRoadmapData, stages, overrides, theme]);

  const nodeMap = useMemo(
    () => new Map(graph.nodes.map((n) => [n.id, n])),
    [graph.nodes]
  );

  const selectedEditNode = useMemo(
    () => graph.nodes.find((n) => n.id === selectedEditNodeId) || null,
    [graph.nodes, selectedEditNodeId]
  );

  const selectedEditEdge = useMemo(
    () => graph.edges.find((e) => e.id === selectedEditEdgeId) || null,
    [graph.edges, selectedEditEdgeId]
  );

  // Detect unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (!currentRoadmapData) return false;
    return (
      JSON.stringify(stages) !== JSON.stringify(currentRoadmapData.stages) ||
      JSON.stringify(overrides) !== JSON.stringify(currentRoadmapData.overrides) ||
      JSON.stringify(theme) !== JSON.stringify(currentRoadmapData.theme)
    );
  }, [stages, overrides, theme, currentRoadmapData]);

  // Save to Database Handler (Supports both Save New Version & Override Current)
  const handleSave = async (overrideCurrent: boolean): Promise<string | null> => {
    if (!currentRoadmapData || !activeSlug) return null;

    setIsSaving(true);
    setSaveStatus(null);
    setIsSaveMenuOpen(false);

    try {
      const res = await fetch('/api/roadmap/save-version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: activeSlug,
          title: currentRoadmapData.title,
          subtitle: currentRoadmapData.subtitle,
          version: currentVersion,
          overrideCurrent,
          stages,
          theme,
          overrides,
        }),
      });

      const json = await res.json();
      if (json.ok) {
        setCurrentVersion(json.version);
        if (!overrideCurrent) {
          // Add newly created row version to versionsList
          setVersionsList((prev) => [
            { version: json.version, is_latest: true },
            ...prev.map((v) => ({ ...v, is_latest: false })),
          ]);
        }
        // Update baseline data so hasUnsavedChanges becomes false
        setCurrentRoadmapData((prev) =>
          prev
            ? {
                ...prev,
                version: json.version,
                stages,
                theme,
                overrides,
              }
            : null
        );

        const msg = overrideCurrent
          ? `✓ Overrode Current v${json.version} in Database!`
          : `✓ Created new row v${json.version} in Database as Latest!`;
        setSaveStatus(msg);
        setTimeout(() => setSaveStatus(null), 5000);
        return `v${json.version}`;
      } else {
        setSaveStatus(`Error: ${json.error || 'Failed to save'}`);
        return null;
      }
    } catch (e: any) {
      setSaveStatus(`Network Error: ${e.message}`);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectRoadmap = (nextSlug: string) => {
    if (nextSlug === activeSlug) return;
    if (
      hasUnsavedChanges &&
      typeof window !== 'undefined' &&
      !window.confirm(
        'You have unsaved changes in the current roadmap. Switch to another roadmap without saving?'
      )
    ) {
      return;
    }
    loadRoadmapData(nextSlug);
  };

  const handleSelectVersion = (targetV: number) => {
    if (targetV === currentVersion) return;
    if (
      hasUnsavedChanges &&
      typeof window !== 'undefined' &&
      !window.confirm('You have unsaved changes. Switch versions without saving?')
    ) {
      return;
    }
    loadRoadmapData(activeSlug, targetV);
  };

  const handleMoveNodes = (nodeIds: string[], dx: number, dy: number) => {
    setOverrides((prev) => {
      const nextOffsets = { ...prev.nodeOffsets };
      for (const id of nodeIds) {
        const cur = nextOffsets[id] || { dx: 0, dy: 0 };
        nextOffsets[id] = { dx: cur.dx + dx, dy: cur.dy + dy };
      }
      return { ...prev, nodeOffsets: nextOffsets };
    });
  };

  const handleMoveEdgeControlPoint = (
    edgeId: string,
    _pointIndex: number,
    allPoints: Array<{ x: number; y: number }>
  ) => {
    setOverrides((prev) => ({
      ...prev,
      edgePoints: {
        ...prev.edgePoints,
        [edgeId]: allPoints,
      },
    }));
  };

  const handleResizeNode = (nodeId: string, width: number, height: number) => {
    setStages((prev) =>
      prev.map((stage) => {
        if (stage.id === nodeId) {
          return { ...stage, width, height };
        }
        return stage;
      })
    );
  };

  const handleUpdateStage = (stageId: string, patch: Partial<RoadmapStageSchema>) => {
    setStages((prev) =>
      prev.map((st) => (st.id === stageId ? { ...st, ...patch } : st))
    );
  };

  const handleMoveStageOrder = (stageId: string, direction: 'up' | 'down') => {
    setStages((prev) => {
      const index = prev.findIndex((s) => s.id === stageId);
      if (index < 0) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const cloned = [...prev];
      const [item] = cloned.splice(index, 1);
      cloned.splice(targetIndex, 0, item);
      return cloned;
    });
  };

  const handleAddCustomEdge = (
    source: string,
    target: string,
    type: SemanticEdgeType
  ) => {
    const customId = `custom-edge-${Date.now()}`;
    const newEdge: RoadmapEdge = {
      id: customId,
      source,
      target,
      type,
      points: [],
    };
    setOverrides((prev) => ({
      ...prev,
      customEdges: [...(prev.customEdges || []), newEdge],
    }));
  };

  const handleDeleteEdge = (edgeId: string) => {
    setOverrides((prev) => ({
      ...prev,
      removedEdgeIds: [...(prev.removedEdgeIds || []), edgeId],
      customEdges: (prev.customEdges || []).filter((e) => e.id !== edgeId),
    }));
    setSelectedEditEdgeId(null);
  };

  const handleChangeSelectedEdgePointCount = (
    edge: RoadmapEdge,
    delta: 1 | -1
  ) => {
    setOverrides((prev) => {
      const existing = prev.edgePoints[edge.id] || edge.points || [];
      if (delta === 1) {
        const last = existing[existing.length - 1] || {
          x: (nodeMap.get(edge.source)?.x || 600) + 30,
          y: (nodeMap.get(edge.source)?.y || 300) + 30,
        };
        const nextPoints = [...existing, { x: last.x + 20, y: last.y + 20 }];
        return {
          ...prev,
          edgePoints: { ...prev.edgePoints, [edge.id]: nextPoints },
        };
      } else {
        if (existing.length <= 1) return prev;
        const nextPoints = existing.slice(0, -1);
        return {
          ...prev,
          edgePoints: { ...prev.edgePoints, [edge.id]: nextPoints },
        };
      }
    });
  };

  const handleUpdateTopicTag = (
    topicId: string,
    tag: TopicRequirementTag
  ) => {
    setOverrides((prev) => ({
      ...prev,
      topicTags: {
        ...(prev.topicTags || {}),
        [topicId]: tag,
      },
    }));
  };

  const handleResetAllOverrides = () => {
    setOverrides({
      nodeOffsets: {},
      edgePoints: {},
      customEdges: [],
      removedEdgeIds: [],
      topicTags: {},
    });
  };

  // If Auth is still loading, show skeleton
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Verifying administrator authorization...</p>
      </div>
    );
  }

  // Access Denied if not admin
  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">Administrator Access Required</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            The Studio Editor is restricted to authorized administrators. Please sign in with an admin account to edit roadmaps and save changes to the database.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setAuthModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 shadow-xs transition-colors"
          >
            Sign In as Admin
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
          >
            Back to Home
          </Link>
        </div>

        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </div>
    );
  }

  // Next version calculation for preview
  const nextIncrementedVersion = currentVersion + 1;

  // Authorized Admin Workspace
  return (
    <main className="min-h-screen flex flex-col">
      {/* 1. STICKY TOP GRAPH EDITOR HEADER & CONTROLS */}
      <div className="sticky top-12 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 py-3 space-y-2.5">
          {/* Top Bar: Selector, Badges, Collapse Toggle, Save Split Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Left: Public Link & Roadmap Selector */}
            <div className="flex flex-wrap items-center gap-2.5">
              {activeSlug ? (
                <Link
                  href={`/roadmap/${activeSlug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                  title="View public reader version"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Public View</span>
                </Link>
              ) : (
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                  title="Go to Home"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Home</span>
                </Link>
              )}

              {/* ROADMAP SELECTOR MENU */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 hidden md:inline">
                  Roadmap:
                </span>
                <select
                  value={activeSlug}
                  onChange={(e) => handleSelectRoadmap(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer pr-1"
                  title="Select roadmap to edit"
                >
                  <option value="" className="bg-white dark:bg-slate-900 text-slate-500">
                    -- Select a Roadmap to Edit --
                  </option>
                  {availableRoadmaps.map((r) => (
                    <option
                      key={r.slug}
                      value={r.slug}
                      className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    >
                      {r.title} (v{r.version})
                    </option>
                  ))}
                </select>
              </div>

              {/* Badges & Version Selector */}
              {activeSlug && (
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    Editor Mode
                  </span>
                  {versionsList.length > 1 ? (
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">ver:</span>
                      <select
                        value={currentVersion}
                        onChange={(e) => handleSelectVersion(Number(e.target.value))}
                        className="bg-transparent text-[10px] font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                        title="Switch roadmap version"
                      >
                        {versionsList.map((v) => (
                          <option
                            key={v.version}
                            value={v.version}
                            className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                          >
                            v{v.version} {v.is_latest ? '(latest)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      v{currentVersion}
                    </span>
                  )}
                  {hasUnsavedChanges && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                      Unsaved
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Right: Controls Toggle, Status Msg & Save Split Button */}
            {activeSlug && (
              <div className="flex items-center gap-2">
                {/* Controls Collapse/Expand Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsControlsCollapsed((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                  title={isControlsCollapsed ? 'Show structure & theme controls' : 'Hide structure & theme controls'}
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  <span>{isControlsCollapsed ? 'Show Controls' : 'Hide Controls'}</span>
                  {isControlsCollapsed ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronUp className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Save Status Notification */}
                {saveStatus && (
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 animate-in fade-in-0">
                    {saveStatus}
                  </span>
                )}

                {/* TWO-OPTION SAVE BUTTON WITH SPLIT DROPDOWN */}
                <div className="relative inline-flex items-center rounded-lg shadow-xs" ref={saveDropdownRef}>
                  {/* Main Action Button */}
                  <button
                    type="button"
                    onClick={() => handleSave(saveMode === 'override_current')}
                    disabled={isSaving}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-l-lg transition-colors border ${
                      saveMode === 'override_current'
                        ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-700'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={
                      saveMode === 'override_current'
                        ? `Overwrites current v${currentVersion} in database without incrementing version`
                        : `Saves roadmap to database as a new version (v${nextIncrementedVersion})`
                    }
                  >
                    {isSaving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : saveMode === 'override_current' ? (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Override Current (v{currentVersion})</span>
                      </>
                    ) : (
                      <>
                        <Database className="w-3.5 h-3.5" />
                        <span>Save to DB (v{nextIncrementedVersion})</span>
                      </>
                    )}
                  </button>

                  {/* Dropdown Chevron Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setIsSaveMenuOpen((prev) => !prev)}
                    disabled={isSaving}
                    aria-label="Open save options menu"
                    className={`px-2 py-1.5 text-xs font-semibold rounded-r-lg border-l transition-colors border ${
                      saveMode === 'override_current'
                        ? 'bg-amber-700 hover:bg-amber-800 text-white border-amber-700 border-l-amber-800/40'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700 border-l-emerald-800/40'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-150 ${
                        isSaveMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Save Options Dropdown Menu */}
                  {isSaveMenuOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-72 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 text-xs animate-in fade-in-0 zoom-in-95">
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                        Save Database Mode
                      </div>

                      {/* Option 1: Save to DB (New Version) */}
                      <button
                        type="button"
                        onClick={() => {
                          setSaveMode('new_version');
                          handleSave(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 flex items-start gap-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                          saveMode === 'new_version' ? 'bg-emerald-50/70 dark:bg-emerald-950/30' : ''
                        }`}
                      >
                        <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              Save to DB (New Version)
                            </span>
                            <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                              v{nextIncrementedVersion}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                            Creates a completely new row as v{nextIncrementedVersion}, preserving older version rows.
                          </p>
                        </div>
                        {saveMode === 'new_version' && (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        )}
                      </button>

                      {/* Option 2: Override Current */}
                      <button
                        type="button"
                        onClick={() => {
                          setSaveMode('override_current');
                          handleSave(true);
                        }}
                        className={`w-full text-left px-3 py-2.5 flex items-start gap-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                          saveMode === 'override_current' ? 'bg-amber-50/70 dark:bg-amber-950/30' : ''
                        }`}
                      >
                        <Save className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              Override Current
                            </span>
                            <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800">
                              v{currentVersion}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                            Updates the current v{currentVersion} row in database without creating a new row.
                          </p>
                        </div>
                        {saveMode === 'override_current' && (
                          <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* STRUCTURE & THEME CONTROLS PANEL (COLLAPSIBLE) */}
          {activeSlug && currentRoadmapData && !isControlsCollapsed && (
            <div className="pt-1 animate-in fade-in-0 duration-150">
              <RoadmapStructureEditor
                slug={activeSlug}
                canvasTitle={overrides.canvasTitle}
                stages={stages}
                graph={graph}
                theme={theme}
                selectedNode={selectedEditNode}
                selectedEdge={selectedEditEdge}
                moveGroupWithSection={moveGroupWithSection}
                topicTags={overrides.topicTags || {}}
                onToggleMoveGroup={setMoveGroupWithSection}
                onUpdateCanvasTitle={(val) =>
                  setOverrides((prev) => ({ ...prev, canvasTitle: val }))
                }
                onUpdateTheme={setTheme}
                onUpdateStage={handleUpdateStage}
                onMoveStageOrder={handleMoveStageOrder}
                onResizeSelectedNode={handleResizeNode}
                onUpdateTopicTag={handleUpdateTopicTag}
                onAddCustomEdge={handleAddCustomEdge}
                onDeleteEdge={handleDeleteEdge}
                onChangeSelectedEdgePointCount={handleChangeSelectedEdgePointCount}
                onResetAllOverrides={handleResetAllOverrides}
                onClose={() => setIsControlsCollapsed(true)}
              />
            </div>
          )}
        </div>
      </div>

      {/* 2. BODY CONTENT: ROADMAP CANVAS OR EMPTY SELECTION DASHBOARD */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">
        {isLoadingRoadmap ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <div className="w-9 h-9 border-4 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 animate-pulse">
              Loading roadmap data...
            </p>
          </div>
        ) : !activeSlug || !currentRoadmapData ? (
          /* EMPTY SELECTION STATE (When user visits editor directly without selecting a roadmap) */
          <div className="max-w-4xl mx-auto py-12 text-center space-y-8 animate-in fade-in-0 duration-200">
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-sm">
                <Compass className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Roadmap Studio Editor
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                No roadmap is currently selected. Choose a roadmap from the dropdown menu above or select one from the catalog below to start editing:
              </p>
            </div>

            {/* Quick-Select Roadmap Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-left">
              {availableRoadmaps.map((r) => (
                <div
                  key={r.slug}
                  onClick={() => loadRoadmapData(r.slug)}
                  className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                        v{r.version}
                      </span>
                      <span className="text-xs font-mono text-slate-400">#{r.slug}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                      {r.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center justify-between w-full text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 pt-2 border-t border-slate-100 dark:border-slate-800 transition-colors"
                  >
                    <span>Select & Edit</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ACTIVE GRAPH CANVAS */
          <div className="animate-in fade-in-0 duration-150">
            <RoadmapSvgCanvas
              graph={graph}
              theme={theme}
              moveGroupWithSection={moveGroupWithSection}
              selectedNodeId={selectedEditNodeId}
              selectedEdgeId={selectedEditEdgeId}
              onSelectEditNode={(node) => {
                setSelectedEditNodeId(node.id);
                setSelectedEditEdgeId(null);
              }}
              onSelectEditEdge={(edge) => {
                setSelectedEditEdgeId(edge.id);
                setSelectedEditNodeId(null);
              }}
              onMoveNodes={handleMoveNodes}
              onMoveEdgeControlPoint={handleMoveEdgeControlPoint}
            />
          </div>
        )}
      </div>
    </main>
  );
}
