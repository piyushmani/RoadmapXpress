'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RoadmapGraph, RoadmapThemeConfig, TopicStatus, TopicRequirementTag } from '@/types/roadmap';
import { THEME_PRESETS, DEFAULT_ROADMAP_THEME } from '@/config/theme';
import SvgView from './svg-view';
import TopicDrawer, { TopicDrawerData } from './topic-drawer';
import { useAuth } from '@/components/auth/auth-provider';
import { Sliders, Settings, BookOpen, Check, X, Palette, ChevronDown } from 'lucide-react';

interface RoadmapViewerProps {
  slug: string;
  title: string;
  subtitle: string;
  totalTopics: number;
  graph?: RoadmapGraph;
  initialTheme?: RoadmapThemeConfig;
  children?: React.ReactNode;
}

interface HoverPillState {
  topicId: string;
  label: string;
  left: number;
  top: number;
  bottom: number;
}

export default function RoadmapViewer({
  slug,
  title,
  subtitle,
  totalTopics,
  graph,
  initialTheme,
  children,
}: RoadmapViewerProps) {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const progressKey = `roadmapxpress_progress_${slug}`;

  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  const [topicStatuses, setTopicStatuses] = useState<Record<string, TopicStatus>>({});
  const [selectedTopic, setSelectedTopic] = useState<TopicDrawerData | null>(null);
  const [hoveredPill, setHoveredPill] = useState<HoverPillState | null>(null);
  const [selectedThemeKey, setSelectedThemeKey] = useState<string>('default');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(`roadmapxpress_theme_pref_${slug}`) || localStorage.getItem('roadmapxpress_user_theme');
      if (savedTheme && (savedTheme === 'default' || THEME_PRESETS[savedTheme])) {
        setSelectedThemeKey(savedTheme);
      }
    } catch (e) {
      // ignore
    }
  }, [slug]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    if (isThemeMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isThemeMenuOpen]);

  const activeTheme = useMemo(() => {
    if (selectedThemeKey !== 'default' && THEME_PRESETS[selectedThemeKey]) {
      return THEME_PRESETS[selectedThemeKey].theme;
    }
    return initialTheme || DEFAULT_ROADMAP_THEME;
  }, [selectedThemeKey, initialTheme]);

  const handleSelectTheme = (key: string) => {
    setSelectedThemeKey(key);
    setIsThemeMenuOpen(false);
    try {
      localStorage.setItem('roadmapxpress_user_theme', key);
      localStorage.setItem(`roadmapxpress_theme_pref_${slug}`, key);
    } catch (e) {
      // ignore
    }
  };

  const activeThemeLabel = selectedThemeKey === 'default'
    ? 'Original'
    : (THEME_PRESETS[selectedThemeKey]?.label || 'Theme');

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

  useEffect(() => {
    if (!containerRef.current) return;
    const elements = containerRef.current.querySelectorAll<SVGGElement>('[data-topic-id]');
    elements.forEach((el) => {
      const topicId = el.getAttribute('data-topic-id') || el.getAttribute('data-label') || '';
      const status = topicStatuses[topicId] || 'pending';
      el.setAttribute('data-status', status);
    });
  }, [topicStatuses]);

  useEffect(() => {
    const handleScroll = () => {
      if (hoveredPill) setHoveredPill(null);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hoveredPill]);

  const updateTopicStatus = (idOrLabel: string, status: TopicStatus) => {
    setTopicStatuses((prev) => {
      const next = { ...prev, [idOrLabel]: status };
      try {
        localStorage.setItem(progressKey, JSON.stringify(next));
      } catch { }
      return next;
    });
  };

  const { completedCount, learningCount, percent } = useMemo(() => {
    let done = 0;
    let learning = 0;
    Object.values(topicStatuses).forEach((st) => {
      if (st === 'done') done += 1;
      else if (st === 'learning' || st === 'in-progress') learning += 1;
    });
    return {
      completedCount: done,
      learningCount: learning,
      percent: totalTopics > 0 ? Math.round((done / totalTopics) * 100) : 0,
    };
  }, [topicStatuses, totalTopics]);

  const scheduleCloseHoverPill = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredPill(null);
    }, 200);
  };

  const handleContainerMouseMove = (e: React.MouseEvent) => {
    const target = (e.target as Element).closest<SVGGElement>('[data-node-id]');
    if (!target) {
      scheduleCloseHoverPill();
      return;
    }

    const topicId = target.getAttribute('data-topic-id');
    const label = target.getAttribute('data-label');
    if (!topicId || !label) {
      scheduleCloseHoverPill();
      return;
    }

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    const rect = target.getBoundingClientRect();
    setHoveredPill({
      topicId,
      label,
      left: rect.left + rect.width / 2,
      top: rect.top,
      bottom: rect.bottom,
    });
  };

  const handlePillMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    const target = (e.target as Element).closest<SVGGElement>('[data-node-id]');
    if (!target) return;
    const topicId = target.getAttribute('data-topic-id');
    const label = target.getAttribute('data-label');
    if (!topicId || !label) return;

    const rawSubtext = target.getAttribute('data-subtext');
    const tag = (target.getAttribute('data-tag') as TopicRequirementTag) || 'none';

    setSelectedTopic({
      id: target.getAttribute('data-node-id') || topicId,
      topicId,
      label,
      subtext: rawSubtext ? JSON.parse(rawSubtext) : undefined,
      tag,
    });
    setHoveredPill(null);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    const target = (e.target as Element).closest<SVGGElement>('[data-node-id]');
    if (!target) return;
    const topicId = target.getAttribute('data-topic-id') || target.getAttribute('data-label');
    if (!topicId) return;

    e.preventDefault();
    const cur = topicStatuses[topicId] || 'pending';
    updateTopicStatus(topicId, cur === 'done' ? 'pending' : 'done');
  };

  const curHoveredStatus = hoveredPill
    ? topicStatuses[hoveredPill.topicId] ||
    topicStatuses[hoveredPill.label] ||
    'pending'
    : 'pending';

  return (
    <>
      {/* Header Card: Roadmap Info + Progress */}
      <div className="mb-6 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 transition-colors">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          <div className="max-w-4xl mx-auto mb-4 flex flex-wrap items-center gap-4 sm:gap-6 text-xs py-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 shadow-2xs">
            <div className="flex justify-between items-center flex-col gap-2">
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] font-bold">
                    ✓
                  </span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">Recommended</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                    ✓
                  </span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">Alternative</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-500 text-white text-[10px] font-bold">
                    ✓
                  </span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">Optional</span>
                </div>
              </div>
              <div className="text-slate-400 dark:text-slate-500 hidden md:block">
                Hover topic for quick status · Click to open resources
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 flex-col">
          {/* Roadmap Theme Switcher Option */}
          <div className="relative" ref={themeMenuRef}>
            <button
              type="button"
              onClick={() => setIsThemeMenuOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
              title="Switch roadmap color theme"
            >
              <Palette className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Theme</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isThemeMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isThemeMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 text-xs animate-in fade-in-0 zoom-in-95">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                  Switch Roadmap Theme
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectTheme('default')}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${selectedThemeKey === 'default'
                    ? 'font-bold text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/40'
                    : 'text-slate-700 dark:text-slate-200'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600 bg-slate-200 dark:bg-slate-700 shrink-0" />
                    <span>Original Theme</span>
                  </div>
                  {selectedThemeKey === 'default' && <Check className="w-3.5 h-3.5" />}
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                {Object.entries(THEME_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectTheme(key)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${selectedThemeKey === key
                      ? 'font-bold text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/40'
                      : 'text-slate-700 dark:text-slate-200'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600 shrink-0"
                        style={{ backgroundColor: preset.theme.nodes.topic.strokeColor }}
                      />
                      <span>{preset.label}</span>
                    </div>
                    {selectedThemeKey === key && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-48 sm:w-56">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>
                {completedCount} / {totalTopics} Done · {learningCount} Learning
              </span>
              <span>{percent}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{
                  width: `${totalTopics > 0 ? (completedCount / totalTopics) * 100 : 0}%`,
                }}
                title={`${completedCount} Completed`}
              />
              <div
                className="h-full bg-purple-500 transition-all duration-300"
                style={{
                  width: `${totalTopics > 0 ? (learningCount / totalTopics) * 100 : 0}%`,
                }}
                title={`${learningCount} Learning`}
              />
            </div>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('roadmapxpress_editor_auto_select', slug);
                }
                router.push('/roadmap/editor');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-colors shadow-xs cursor-pointer"
              title="Only visible to Admins. Opens the Studio Editor."
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Studio Editor</span>
              <Settings className="w-3 h-3 text-amber-500 dark:text-amber-600" />
            </button>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        onClick={handleContainerClick}
        onMouseMove={handleContainerMouseMove}
        onMouseLeave={scheduleCloseHoverPill}
        onContextMenu={handleContextMenu}
        className="relative"
      >
        {graph ? (
          <SvgView graph={graph} theme={activeTheme} />
        ) : (
          children
        )}
      </div>

      {hoveredPill && (
        <div
          style={{
            position: 'fixed',
            left: `${hoveredPill.left}px`,
            top: `${hoveredPill.top < 52 ? hoveredPill.bottom + 8 : hoveredPill.top - 42
              }px`,
            transform: 'translateX(-50%)',
          }}
          onMouseEnter={handlePillMouseEnter}
          onMouseLeave={scheduleCloseHoverPill}
          className="z-50 flex items-center bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden divide-x divide-slate-200 dark:divide-slate-800 text-xs font-semibold select-none animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {/* Segment 1: Learning */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const key = hoveredPill.topicId || hoveredPill.label;
              const next =
                curHoveredStatus === 'learning' || curHoveredStatus === 'in-progress'
                  ? 'pending'
                  : 'learning';
              updateTopicStatus(key, next);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors cursor-pointer ${curHoveredStatus === 'learning' || curHoveredStatus === 'in-progress'
              ? 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200'
              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Learning</span>
          </button>

          {/* Segment 2: Done */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const key = hoveredPill.topicId || hoveredPill.label;
              const next = curHoveredStatus === 'done' ? 'pending' : 'done';
              updateTopicStatus(key, next);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors cursor-pointer ${curHoveredStatus === 'done'
              ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Done</span>
          </button>

          {/* Segment 3: Skip */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const key = hoveredPill.topicId || hoveredPill.label;
              const next = curHoveredStatus === 'skipped' ? 'pending' : 'skipped';
              updateTopicStatus(key, next);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors cursor-pointer ${curHoveredStatus === 'skipped'
              ? 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <X className="w-3.5 h-3.5 text-slate-500" />
            <span>Skip</span>
          </button>
        </div>
      )}

      <TopicDrawer
        roadmapTitle={title}
        node={selectedTopic}
        status={
          selectedTopic
            ? topicStatuses[selectedTopic.topicId] ||
            topicStatuses[selectedTopic.label] ||
            'pending'
            : 'pending'
        }
        onClose={() => setSelectedTopic(null)}
        onChangeStatus={(target, status) => {
          const key =
            typeof target === 'string'
              ? target
              : target.topicId || target.label;
          updateTopicStatus(key, status);
        }}
      />
    </>
  );
}
