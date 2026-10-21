'use client';

import React, { useState } from 'react';
import {
  RoadmapStageSchema,
  RoadmapNode,
  RoadmapEdge,
  RoadmapGraph,
  SemanticEdgeType,
  RoadmapThemeConfig,
  NodeBoxStyle,
  EdgeLineStyle,
  EdgeCurveStyle,
} from '@/types/roadmap';
import { THEME_PRESETS } from '@/config/theme';
import {
  Palette,
  Layers,
  Sliders,
  Save,
  RotateCcw,
  Check,
  Plus,
  Trash2,
  Move,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  MapPin,
  Columns,
} from 'lucide-react';

interface RoadmapStructureEditorProps {
  slug: string;
  stages: RoadmapStageSchema[];
  graph: RoadmapGraph;
  theme: RoadmapThemeConfig;
  selectedNode: RoadmapNode | null;
  selectedEdge: RoadmapEdge | null;
  moveGroupWithSection: boolean;
  onToggleMoveGroup: (val: boolean) => void;
  onUpdateTheme: (nextTheme: RoadmapThemeConfig) => void;
  onUpdateStage: (
    stageId: string,
    patch: Partial<RoadmapStageSchema>
  ) => void;
  onMoveStageOrder: (stageId: string, direction: 'up' | 'down') => void;
  onResizeSelectedNode: (nodeId: string, width: number, height: number) => void;
  onAddCustomEdge: (
    source: string,
    target: string,
    type: SemanticEdgeType
  ) => void;
  onDeleteEdge: (edgeId: string) => void;
  onChangeSelectedEdgePointCount: (edge: RoadmapEdge, delta: 1 | -1) => void;
  onSaveNewVersionFile: (overrideCurrent?: boolean) => Promise<string | null>;
  onResetAllOverrides: () => void;
  onClose?: () => void;
}

type StudioTab = 'nodes' | 'edges' | 'canvas' | 'structure';
type NodeCategoryKey = 'topic' | 'subtopic' | 'section' | 'subsection';
type EdgeCategoryKey = 'spine' | 'branch' | 'subBranch';

function RangeControl({
  label,
  value,
  min,
  max,
  step = 1,
  unit = 'px',
  onChange,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-mono text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
      />
      {hint && <p className="text-[11px] text-slate-500 leading-tight">{hint}</p>}
    </div>
  );
}

function ColorPickerControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="space-y-1">
      <span className="text-xs font-medium text-slate-700 block">{label}</span>
      <div className="flex items-center gap-2 px-2 py-1 bg-white border border-slate-200 rounded-lg shadow-xs hover:border-slate-300 transition-colors">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-6 w-6 rounded cursor-pointer border border-slate-300 p-0 bg-transparent"
        />
        <span className="text-xs font-mono font-medium text-slate-700 uppercase">
          {value}
        </span>
      </div>
    </div>
  );
}

export default function RoadmapStructureEditor({
  slug,
  stages,
  graph,
  theme,
  selectedNode,
  selectedEdge,
  moveGroupWithSection,
  onToggleMoveGroup,
  onUpdateTheme,
  onUpdateStage,
  onMoveStageOrder,
  onResizeSelectedNode,
  onAddCustomEdge,
  onDeleteEdge,
  onChangeSelectedEdgePointCount,
  onSaveNewVersionFile,
  onResetAllOverrides,
  onClose,
}: RoadmapStructureEditorProps) {
  const [activeTab, setActiveTab] = useState<StudioTab>('nodes');
  const [nodeCat, setNodeCat] = useState<NodeCategoryKey>('section');
  const [edgeCat, setEdgeCat] = useState<EdgeCategoryKey>('spine');

  const [edgeSource, setEdgeSource] = useState('');
  const [edgeTarget, setEdgeTarget] = useState('');
  const [edgeType, setEdgeType] = useState<SemanticEdgeType>('branch-edge');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const patchNodeCategory = (
    cat: NodeCategoryKey,
    patch: Partial<NodeBoxStyle>
  ) => {
    onUpdateTheme({
      ...theme,
      nodes: {
        ...theme.nodes,
        [cat]: {
          ...theme.nodes[cat],
          ...patch,
        },
      },
    });
  };

  const patchEdgeCategory = (
    cat: EdgeCategoryKey,
    patch: Partial<EdgeLineStyle>
  ) => {
    onUpdateTheme({
      ...theme,
      edges: {
        ...theme.edges,
        [cat]: {
          ...theme.edges[cat],
          ...patch,
        },
      },
    });
  };

  const patchCanvas = (patch: Partial<RoadmapThemeConfig['canvas']>) => {
    onUpdateTheme({
      ...theme,
      canvas: {
        ...theme.canvas,
        ...patch,
      },
    });
  };

  const handleSaveNewVersion = async () => {
    const savedFile = await onSaveNewVersionFile();
    if (savedFile) {
      setStatusMsg('✓ Saved ' + savedFile);
      setTimeout(() => setStatusMsg(null), 3500);
    }
  };

  const currentNodeStyle = theme.nodes[nodeCat];
  const currentEdgeStyle = theme.edges[edgeCat];
  const isContainerCat = nodeCat === 'section' || nodeCat === 'subsection';

  return (
    <aside className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden transition-all">
      {/* HEADER BAR */}
      <div className="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="inline-flex p-1 bg-slate-200/70 rounded-xl gap-1">
          {(
            [
              { id: 'nodes', label: 'Nodes & Markers', icon: Layers },
              { id: 'edges', label: 'Edges & Routing', icon: Move },
              { id: 'canvas', label: 'Spacing & Canvas', icon: Sliders },
              { id: 'structure', label: 'Stages & Nodes', icon: Columns },
            ] as const
          ).map((t) => {
            const IconComponent = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ' +
                  (isActive
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50')
                }
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveNewVersion}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
            title="Saves roadmap directly to Supabase database as latest"
          >
            {statusMsg ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{statusMsg}</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save to Database</span>
              </>
            )}
          </button>
          <button
            onClick={onResetAllOverrides}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 shadow-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Overrides</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Collapse controls panel"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Collapse</span>
            </button>
          )}
        </div>
      </div>

      {/* THEME PRESET CHIPS BAR */}
      <div className="px-4 py-2.5 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Palette className="w-3.5 h-3.5 text-slate-500" />
          <span>Presets:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {Object.entries(THEME_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => onUpdateTheme(preset.theme)}
              className="px-2.5 py-1 rounded-md text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs transition-all hover:border-slate-300"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT SCROLLABLE VIEWPORT */}
      <div className="max-h-[38vh] overflow-y-auto overscroll-contain">
        {/* TAB 1: NODES & MARKERS */}
      {activeTab === 'nodes' && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {/* Node Category Selection */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Node Type
            </h4>
            <div className="space-y-1">
              {(
                [
                  { id: 'section', label: 'Main Section' },
                  { id: 'subsection', label: 'Sub-Section' },
                  { id: 'topic', label: 'Primary Topic' },
                  { id: 'subtopic', label: 'Sub-Topic Node' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setNodeCat(item.id)}
                  className={
                    'w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ' +
                    (nodeCat === item.id
                      ? 'bg-blue-600 text-white shadow-xs font-semibold'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100')
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Styling */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {nodeCat.toUpperCase()} Colors
            </h4>
            <div className="grid grid-cols-1 gap-2.5">
              <ColorPickerControl
                label="Fill Color"
                value={currentNodeStyle.fillColor}
                onChange={(val) => patchNodeCategory(nodeCat, { fillColor: val })}
              />
              <ColorPickerControl
                label="Border Color"
                value={currentNodeStyle.strokeColor}
                onChange={(val) => patchNodeCategory(nodeCat, { strokeColor: val })}
              />
              <ColorPickerControl
                label="Text Color"
                value={currentNodeStyle.textColor}
                onChange={(val) => patchNodeCategory(nodeCat, { textColor: val })}
              />
            </div>

            {isContainerCat && (
              <div className="pt-2.5 border-t border-slate-200 space-y-2.5">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={currentNodeStyle.titleOnBorder ?? true}
                    onChange={(e) =>
                      patchNodeCategory(nodeCat, {
                        titleOnBorder: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span>Write Title on Top Border Line</span>
                </label>
                <RangeControl
                  label="Title Side Padding"
                  value={currentNodeStyle.borderTitlePaddingX ?? 14}
                  min={6}
                  max={36}
                  step={2}
                  onChange={(val) =>
                    patchNodeCategory(nodeCat, { borderTitlePaddingX: val })
                  }
                />
              </div>
            )}
          </div>

          {/* Typography & Borders */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Geometry & Text
            </h4>
            <RangeControl
              label="Font Size"
              value={currentNodeStyle.fontSize}
              min={10}
              max={22}
              step={0.5}
              onChange={(val) => patchNodeCategory(nodeCat, { fontSize: val })}
            />
            <RangeControl
              label="Corner Radius"
              value={currentNodeStyle.borderRadius}
              min={0}
              max={20}
              step={1}
              onChange={(val) => patchNodeCategory(nodeCat, { borderRadius: val })}
            />
            <RangeControl
              label="Border Width"
              value={currentNodeStyle.strokeWidth}
              min={0.5}
              max={4}
              step={0.2}
              onChange={(val) => patchNodeCategory(nodeCat, { strokeWidth: val })}
            />
          </div>

          {/* Marker SVG Settings */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Milestone Pin Marker
            </h4>
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-700 block">Shape</span>
              <select
                value={theme.nodes.milestone.shape}
                onChange={(e) =>
                  onUpdateTheme({
                    ...theme,
                    nodes: {
                      ...theme.nodes,
                      milestone: {
                        ...theme.nodes.milestone,
                        shape: e.target.value as 'pin' | 'circle',
                      },
                    },
                  })
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="pin">📍 Location Pin SVG</option>
                <option value="circle">● Solid Dot Marker</option>
              </select>
            </div>

            <ColorPickerControl
              label="Marker Color"
              value={theme.nodes.milestone.color}
              onChange={(val) =>
                onUpdateTheme({
                  ...theme,
                  nodes: {
                    ...theme.nodes,
                    milestone: {
                      ...theme.nodes.milestone,
                      color: val,
                    },
                  },
                })
              }
            />

            <RangeControl
              label="Marker Size"
              value={theme.nodes.milestone.size}
              min={18}
              max={44}
              step={2}
              onChange={(val) =>
                onUpdateTheme({
                  ...theme,
                  nodes: {
                    ...theme.nodes,
                    milestone: {
                      ...theme.nodes.milestone,
                      size: val,
                    },
                  },
                })
              }
            />

            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 pt-1">
              <input
                type="checkbox"
                checked={theme.nodes.milestone.showGroundShadow}
                onChange={(e) =>
                  onUpdateTheme({
                    ...theme,
                    nodes: {
                      ...theme.nodes,
                      milestone: {
                        ...theme.nodes.milestone,
                        showGroundShadow: e.target.checked,
                      },
                    },
                  })
                }
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <span>Show Ground Shadow Ring</span>
            </label>
          </div>
        </div>
      )}

      {/* TAB 2: EDGES & ROUTING */}
      {activeTab === 'edges' && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {/* Edge Category Selection */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Edge Type
            </h4>
            <div className="space-y-1">
              {(
                [
                  { id: 'spine', label: 'Central Spine Road' },
                  { id: 'branch', label: 'Main Section Branches' },
                  { id: 'subBranch', label: 'Sub-Section Connectors' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setEdgeCat(item.id)}
                  className={
                    'w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ' +
                    (edgeCat === item.id
                      ? 'bg-blue-600 text-white shadow-xs font-semibold'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100')
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Edge Style & Road Track */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {edgeCat.toUpperCase()} Routing & Styling
            </h4>

            <ColorPickerControl
              label="Line Color"
              value={currentEdgeStyle.strokeColor}
              onChange={(val) => patchEdgeCategory(edgeCat, { strokeColor: val })}
            />

            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(currentEdgeStyle.roadTrack)}
                onChange={(e) =>
                  patchEdgeCategory(edgeCat, { roadTrack: e.target.checked })
                }
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <span>Road Track (Center Dashed Line)</span>
            </label>

            <RangeControl
              label="Line Thickness"
              value={currentEdgeStyle.strokeWidth}
              min={1}
              max={18}
              step={0.5}
              onChange={(val) => patchEdgeCategory(edgeCat, { strokeWidth: val })}
            />

            <RangeControl
              label="Draggable Control Points"
              value={currentEdgeStyle.controlPointsCount ?? 2}
              min={1}
              max={6}
              step={1}
              unit=" pts"
              onChange={(val) =>
                patchEdgeCategory(edgeCat, { controlPointsCount: val })
              }
              hint="Additional points allow curving around boxes cleanly."
            />

            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-700 block">
                Routing Curve Style
              </span>
              <select
                value={currentEdgeStyle.curveStyle}
                onChange={(e) =>
                  patchEdgeCategory(edgeCat, {
                    curveStyle: e.target.value as EdgeCurveStyle,
                  })
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="bezier">Smooth Bezier Spline</option>
                <option value="orthogonal">Right-Angle Step (Orthogonal)</option>
                <option value="straight">Segmented Straight Lines</option>
              </select>
            </div>
          </div>

          {/* Selected Edge & Connect Nodes */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Selected Edge & Custom Connections
            </h4>

            {selectedEdge ? (
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2.5">
                <div className="text-xs font-semibold text-slate-800">
                  Active Edge: <span className="font-mono text-amber-700">{selectedEdge.id}</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => onChangeSelectedEdgePointCount(selectedEdge, 1)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Bend Point</span>
                  </button>
                  <button
                    onClick={() => onChangeSelectedEdgePointCount(selectedEdge, -1)}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    - Remove Point
                  </button>
                  <button
                    onClick={() => onDeleteEdge(selectedEdge.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200">
                Click any line or orange bend handle on the canvas to inspect or adjust its curve points.
              </p>
            )}

            <div className="pt-2 border-t border-slate-200 space-y-2.5">
              <span className="text-xs font-semibold text-slate-700 block">
                Connect Two Nodes
              </span>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={edgeSource}
                  onChange={(e) => setEdgeSource(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-xs text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">From Node...</option>
                  {graph.nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.label ? n.label : n.id} ({n.type})
                    </option>
                  ))}
                </select>

                <select
                  value={edgeTarget}
                  onChange={(e) => setEdgeTarget(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-xs text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">To Node...</option>
                  {graph.nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.label ? n.label : n.id} ({n.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={edgeType}
                  onChange={(e) =>
                    setEdgeType(e.target.value as SemanticEdgeType)
                  }
                  className="flex-1 px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-xs text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="branch-edge">Main Branch Style</option>
                  <option value="sub-branch-edge">Sub-Branch Style</option>
                  <option value="spine-edge">Spine Road Style</option>
                </select>
                <button
                  onClick={() => {
                    if (edgeSource && edgeTarget && edgeSource !== edgeTarget) {
                      onAddCustomEdge(edgeSource, edgeTarget, edgeType);
                      setEdgeSource('');
                      setEdgeTarget('');
                    }
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Connect</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SPACING & CANVAS */}
      {activeTab === 'canvas' && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Canvas & Typography
            </h4>
            <ColorPickerControl
              label="Canvas Background Color"
              value={theme.canvas.backgroundColor}
              onChange={(val) => patchCanvas({ backgroundColor: val })}
            />
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-700 block">
                Global Font Family
              </span>
              <select
                value={theme.canvas.fontFamily}
                onChange={(e) => patchCanvas({ fontFamily: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="Inter, system-ui, sans-serif">Inter (Clean Modern Sans)</option>
                <option value="Architects Daughter, Inter, cursive">
                  Architects Daughter (Handwritten)
                </option>
                <option value="ui-monospace, SFMono-Regular, Menlo, monospace">
                  JetBrains Monospace
                </option>
                <option value="Georgia, serif">Editorial Serif</option>
              </select>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Topic Breathing Room
            </h4>
            <RangeControl
              label="Main Topic Gap"
              value={theme.canvas.topicGap}
              min={6}
              max={28}
              step={2}
              onChange={(val) => patchCanvas({ topicGap: val })}
            />
            <RangeControl
              label="Sub-Topic Gap"
              value={theme.canvas.subTopicGap}
              min={6}
              max={26}
              step={2}
              onChange={(val) => patchCanvas({ subTopicGap: val })}
            />
            <RangeControl
              label="Section Inner Padding"
              value={theme.canvas.sectionPadding}
              min={10}
              max={36}
              step={2}
              onChange={(val) => patchCanvas({ sectionPadding: val })}
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Spine & Stage Separation
            </h4>
            <RangeControl
              label="Vertical Stage Gap"
              value={theme.canvas.stageVerticalGap}
              min={20}
              max={90}
              step={4}
              onChange={(val) => patchCanvas({ stageVerticalGap: val })}
            />
            <RangeControl
              label="Parent-to-Sub-Section Gap"
              value={theme.canvas.subSectionGap}
              min={14}
              max={64}
              step={2}
              onChange={(val) => patchCanvas({ subSectionGap: val })}
            />
            <RangeControl
              label="Spine Branch Distance"
              value={theme.canvas.spineBranchGap}
              min={32}
              max={120}
              step={4}
              onChange={(val) => patchCanvas({ spineBranchGap: val })}
            />
          </div>
        </div>
      )}

      {/* TAB 4: STAGE & NODE STRUCTURE */}
      {activeTab === 'structure' && (
        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Selected Element Inspector
              </h4>
              <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={moveGroupWithSection}
                  onChange={(e) => onToggleMoveGroup(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span>Move child topics with section</span>
              </label>
            </div>

            {selectedNode ? (
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900">
                    {selectedNode.label || selectedNode.id}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {selectedNode.type}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Coordinates: x={selectedNode.x}, y={selectedNode.y}
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <label className="text-xs font-medium text-slate-700">
                    Width (px)
                    <input
                      type="number"
                      value={selectedNode.width}
                      onChange={(e) =>
                        onResizeSelectedNode(
                          selectedNode.id,
                          Number(e.target.value) || selectedNode.width,
                          selectedNode.height
                        )
                      }
                      className="mt-1 w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-xs font-mono text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </label>
                  <label className="text-xs font-medium text-slate-700">
                    Height (px)
                    <input
                      type="number"
                      value={selectedNode.height}
                      onChange={(e) =>
                        onResizeSelectedNode(
                          selectedNode.id,
                          selectedNode.width,
                          Number(e.target.value) || selectedNode.height
                        )
                      }
                      className="mt-1 w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-xs font-mono text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 bg-white p-3 rounded-xl border border-slate-200">
                Click or drag any box on the roadmap canvas below to inspect its dimensions and coordinates.
              </p>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Stages Alignment & Order
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {stages.map((st, idx) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-slate-200 text-xs shadow-xs"
                >
                  <span className="font-medium text-slate-800 truncate max-w-[160px]">
                    {idx + 1}. {st.title || st.topics?.[0]?.toString() || st.id}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        onUpdateStage(st.id, {
                          side: st.side === 'left' ? 'right' : 'left',
                        })
                      }
                      className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 font-medium text-[11px] text-slate-700 transition-colors"
                    >
                      {st.side === 'left' ? '⬅ Left' : 'Right ➡'}
                    </button>
                    {!st.standaloneTopic && !st.groups && (
                      <button
                        onClick={() =>
                          onUpdateStage(st.id, {
                            columns:
                              (((st.columns || 2) % 3) + 1) as 1 | 2 | 3,
                          })
                        }
                        className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 font-mono text-[11px] text-slate-700 transition-colors"
                      >
                        {st.columns || 2} cols
                      </button>
                    )}
                    <button
                      onClick={() => onMoveStageOrder(st.id, 'up')}
                      className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Move stage up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onMoveStageOrder(st.id, 'down')}
                      className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Move stage down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>
    </aside>
  );
}
