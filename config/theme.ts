import { RoadmapThemeConfig } from '@/types/roadmap';
import { isDarkColor } from '@/lib/svgEdgeUtils';

export const DEFAULT_ROADMAP_THEME: RoadmapThemeConfig = {
  nodes: {
    topic: {
      fillColor: '#ffffff',
      strokeColor: '#0ea5e9',
      textColor: '#0f172a',
      fontSize: 13.5,
      borderRadius: 8,
      strokeWidth: 1.5,
      dashed: false,
    },
    subtopic: {
      fillColor: '#ffffff',
      strokeColor: '#94a3b8',
      textColor: '#334155',
      fontSize: 12.5,
      borderRadius: 6,
      strokeWidth: 1.2,
      dashed: false,
    },
    section: {
      fillColor: '#ffffff',
      strokeColor: '#cbd5e1',
      textColor: '#0f172a',
      fontSize: 15.5,
      borderRadius: 12,
      strokeWidth: 1.5,
      dashed: false,
      titleOnBorder: true,
      borderTitlePaddingX: 14,
    },
    subsection: {
      fillColor: '#f1f5f9',
      strokeColor: '#94a3b8',
      textColor: '#334155',
      fontSize: 13,
      borderRadius: 8,
      strokeWidth: 1.2,
      dashed: true,
      titleOnBorder: true,
      borderTitlePaddingX: 10,
    },
    milestone: {
      shape: 'pin',
      color: '#0284c7',
      size: 28,
      showGroundShadow: true,
    },
  },
  edges: {
    spine: {
      strokeColor: '#94a3b8',
      strokeWidth: 12,
      dashed: true,
      curveStyle: 'bezier',
      roadTrack: true,
      controlPointsCount: 2,
    },
    branch: {
      strokeColor: '#64748b',
      strokeWidth: 2,
      dashed: false,
      curveStyle: 'bezier',
      roadTrack: false,
      controlPointsCount: 2,
    },
    subBranch: {
      strokeColor: '#94a3b8',
      strokeWidth: 1.6,
      dashed: true,
      curveStyle: 'orthogonal',
      roadTrack: false,
      controlPointsCount: 2,
    },
  },
  canvas: {
    backgroundColor: '#f8fafc',
    fontFamily: 'Inter, system-ui, sans-serif',
    titleColor: '#0f172a',
    titleFontSize: 24,
    topicGap: 14,
    subTopicGap: 12,
    sectionPadding: 20,
    stageVerticalGap: 48,
    subSectionGap: 34,
    spineBranchGap: 68,
  },
};

export const THEME_PRESETS: Record<
  string,
  { label: string; theme: RoadmapThemeConfig }
> = {
  // 1. Minimal Slate (Clean Modern Monochrome)
  minimalSlate: {
    label: 'Minimal Slate',
    theme: DEFAULT_ROADMAP_THEME,
  },

  // 2. Soft Honey (Warm Amber)
  softHoney: {
    label: 'Soft Honey',
    theme: {
      ...DEFAULT_ROADMAP_THEME,
      nodes: {
        ...DEFAULT_ROADMAP_THEME.nodes,
        topic: {
          fillColor: '#fef3c7',
          strokeColor: '#f59e0b',
          textColor: '#78350f',
          fontSize: 13.5,
          borderRadius: 8,
          strokeWidth: 1.5,
        },
        subtopic: {
          fillColor: '#fffbeb',
          strokeColor: '#fcd34d',
          textColor: '#92400e',
          fontSize: 12.5,
          borderRadius: 6,
          strokeWidth: 1.2,
        },
        section: {
          fillColor: '#ffffff',
          strokeColor: '#fde68a',
          textColor: '#78350f',
          fontSize: 15.5,
          borderRadius: 12,
          strokeWidth: 1.5,
          titleOnBorder: true,
          borderTitlePaddingX: 14,
        },
        subsection: {
          fillColor: '#fffbeb',
          strokeColor: '#fcd34d',
          textColor: '#92400e',
          fontSize: 13,
          borderRadius: 8,
          strokeWidth: 1.2,
          dashed: true,
          titleOnBorder: true,
          borderTitlePaddingX: 10,
        },
        milestone: {
          shape: 'pin',
          color: '#d97706',
          size: 28,
          showGroundShadow: true,
        },
      },
      edges: {
        ...DEFAULT_ROADMAP_THEME.edges,
        spine: {
          ...DEFAULT_ROADMAP_THEME.edges.spine,
          strokeColor: '#d97706',
        },
        branch: {
          ...DEFAULT_ROADMAP_THEME.edges.branch,
          strokeColor: '#f59e0b',
        },
        subBranch: {
          ...DEFAULT_ROADMAP_THEME.edges.subBranch,
          strokeColor: '#fbbf24',
        },
      },
      canvas: {
        ...DEFAULT_ROADMAP_THEME.canvas,
        backgroundColor: '#fffdfa',
        titleColor: '#78350f',
      },
    },
  },

  // 3. Nordic Sage (Fresh Mint & Emerald)
  nordicSage: {
    label: 'Nordic Sage',
    theme: {
      ...DEFAULT_ROADMAP_THEME,
      nodes: {
        ...DEFAULT_ROADMAP_THEME.nodes,
        topic: {
          fillColor: '#dcfce7',
          strokeColor: '#10b981',
          textColor: '#064e3b',
          fontSize: 13.5,
          borderRadius: 8,
          strokeWidth: 1.5,
        },
        subtopic: {
          fillColor: '#ffffff',
          strokeColor: '#6ee7b7',
          textColor: '#065f46',
          fontSize: 12.5,
          borderRadius: 6,
          strokeWidth: 1.2,
        },
        section: {
          fillColor: '#ffffff',
          strokeColor: '#a7f3d0',
          textColor: '#064e3b',
          fontSize: 15.5,
          borderRadius: 12,
          strokeWidth: 1.5,
          titleOnBorder: true,
          borderTitlePaddingX: 14,
        },
        subsection: {
          fillColor: '#f0fdf4',
          strokeColor: '#6ee7b7',
          textColor: '#047857',
          fontSize: 13,
          borderRadius: 8,
          strokeWidth: 1.2,
          dashed: true,
          titleOnBorder: true,
          borderTitlePaddingX: 10,
        },
        milestone: {
          shape: 'pin',
          color: '#059669',
          size: 28,
          showGroundShadow: true,
        },
      },
      edges: {
        ...DEFAULT_ROADMAP_THEME.edges,
        spine: {
          ...DEFAULT_ROADMAP_THEME.edges.spine,
          strokeColor: '#10b981',
        },
        branch: {
          ...DEFAULT_ROADMAP_THEME.edges.branch,
          strokeColor: '#059669',
        },
        subBranch: {
          ...DEFAULT_ROADMAP_THEME.edges.subBranch,
          strokeColor: '#34d399',
        },
      },
      canvas: {
        ...DEFAULT_ROADMAP_THEME.canvas,
        backgroundColor: '#f0fdf4',
        titleColor: '#064e3b',
      },
    },
  },

  // 4. Ocean Breeze (Sky Blue & Navy)
  oceanBreeze: {
    label: 'Ocean Breeze',
    theme: {
      ...DEFAULT_ROADMAP_THEME,
      nodes: {
        ...DEFAULT_ROADMAP_THEME.nodes,
        topic: {
          fillColor: '#e0f2fe',
          strokeColor: '#0284c7',
          textColor: '#0c4a6e',
          fontSize: 13.5,
          borderRadius: 8,
          strokeWidth: 1.5,
        },
        subtopic: {
          fillColor: '#ffffff',
          strokeColor: '#7dd3fc',
          textColor: '#0369a1',
          fontSize: 12.5,
          borderRadius: 6,
          strokeWidth: 1.2,
        },
        section: {
          fillColor: '#ffffff',
          strokeColor: '#bae6fd',
          textColor: '#0c4a6e',
          fontSize: 15.5,
          borderRadius: 12,
          strokeWidth: 1.5,
          titleOnBorder: true,
          borderTitlePaddingX: 14,
        },
        subsection: {
          fillColor: '#f0f9ff',
          strokeColor: '#7dd3fc',
          textColor: '#0284c7',
          fontSize: 13,
          borderRadius: 8,
          strokeWidth: 1.2,
          dashed: true,
          titleOnBorder: true,
          borderTitlePaddingX: 10,
        },
        milestone: {
          shape: 'pin',
          color: '#0284c7',
          size: 28,
          showGroundShadow: true,
        },
      },
      edges: {
        ...DEFAULT_ROADMAP_THEME.edges,
        spine: {
          ...DEFAULT_ROADMAP_THEME.edges.spine,
          strokeColor: '#0284c7',
        },
        branch: {
          ...DEFAULT_ROADMAP_THEME.edges.branch,
          strokeColor: '#2563eb',
        },
        subBranch: {
          ...DEFAULT_ROADMAP_THEME.edges.subBranch,
          strokeColor: '#38bdf8',
        },
      },
      canvas: {
        ...DEFAULT_ROADMAP_THEME.canvas,
        backgroundColor: '#f0f9ff',
        titleColor: '#0c4a6e',
      },
    },
  },

  // 5. Lavender Dream (Soft Violet & Lilac)
  lavenderDream: {
    label: 'Lavender Dream',
    theme: {
      ...DEFAULT_ROADMAP_THEME,
      nodes: {
        ...DEFAULT_ROADMAP_THEME.nodes,
        topic: {
          fillColor: '#f3e8ff',
          strokeColor: '#9333ea',
          textColor: '#581c87',
          fontSize: 13.5,
          borderRadius: 8,
          strokeWidth: 1.5,
        },
        subtopic: {
          fillColor: '#ffffff',
          strokeColor: '#c084fc',
          textColor: '#6b21a8',
          fontSize: 12.5,
          borderRadius: 6,
          strokeWidth: 1.2,
        },
        section: {
          fillColor: '#ffffff',
          strokeColor: '#e9d5ff',
          textColor: '#3b0764',
          fontSize: 15.5,
          borderRadius: 12,
          strokeWidth: 1.5,
          titleOnBorder: true,
          borderTitlePaddingX: 14,
        },
        subsection: {
          fillColor: '#faf5ff',
          strokeColor: '#c084fc',
          textColor: '#7e22ce',
          fontSize: 13,
          borderRadius: 8,
          strokeWidth: 1.2,
          dashed: true,
          titleOnBorder: true,
          borderTitlePaddingX: 10,
        },
        milestone: {
          shape: 'pin',
          color: '#7c3aed',
          size: 28,
          showGroundShadow: true,
        },
      },
      edges: {
        ...DEFAULT_ROADMAP_THEME.edges,
        spine: {
          ...DEFAULT_ROADMAP_THEME.edges.spine,
          strokeColor: '#9333ea',
        },
        branch: {
          ...DEFAULT_ROADMAP_THEME.edges.branch,
          strokeColor: '#7c3aed',
        },
        subBranch: {
          ...DEFAULT_ROADMAP_THEME.edges.subBranch,
          strokeColor: '#a855f7',
        },
      },
      canvas: {
        ...DEFAULT_ROADMAP_THEME.canvas,
        backgroundColor: '#faf5ff',
        titleColor: '#3b0764',
      },
    },
  },

  // 6. Paper & Ink (Handwritten Sketch)
  paperSketch: {
    label: 'Paper & Ink',
    theme: {
      ...DEFAULT_ROADMAP_THEME,
      nodes: {
        ...DEFAULT_ROADMAP_THEME.nodes,
        topic: {
          fillColor: '#fef9c3',
          strokeColor: '#1e293b',
          textColor: '#0f172a',
          fontSize: 13.5,
          borderRadius: 5,
          strokeWidth: 2,
        },
        subtopic: {
          fillColor: '#ffffff',
          strokeColor: '#334155',
          textColor: '#1e293b',
          fontSize: 12.5,
          borderRadius: 5,
          strokeWidth: 1.6,
        },
        section: {
          fillColor: '#ffffff',
          strokeColor: '#1e293b',
          textColor: '#0f172a',
          fontSize: 15.5,
          borderRadius: 8,
          strokeWidth: 2.2,
          titleOnBorder: true,
          borderTitlePaddingX: 14,
        },
        subsection: {
          fillColor: '#f8fafc',
          strokeColor: '#64748b',
          textColor: '#334155',
          fontSize: 13,
          borderRadius: 6,
          strokeWidth: 1.5,
          dashed: true,
          titleOnBorder: true,
          borderTitlePaddingX: 10,
        },
        milestone: {
          shape: 'pin',
          color: '#ef4444',
          size: 28,
          showGroundShadow: true,
        },
      },
      edges: {
        ...DEFAULT_ROADMAP_THEME.edges,
        spine: {
          ...DEFAULT_ROADMAP_THEME.edges.spine,
          strokeColor: '#1e293b',
        },
        branch: {
          ...DEFAULT_ROADMAP_THEME.edges.branch,
          strokeColor: '#334155',
          strokeWidth: 2.2,
        },
        subBranch: {
          ...DEFAULT_ROADMAP_THEME.edges.subBranch,
          strokeColor: '#64748b',
          strokeWidth: 1.6,
        },
      },
      canvas: {
        ...DEFAULT_ROADMAP_THEME.canvas,
        backgroundColor: '#ffffff',
        fontFamily: 'Architects Daughter, Inter, cursive',
        titleColor: '#0f172a',
      },
    },
  },

  // 7. Midnight Pro (Sleek Dark Mode)
  midnightPro: {
    label: 'Midnight Pro',
    theme: {
      ...DEFAULT_ROADMAP_THEME,
      nodes: {
        ...DEFAULT_ROADMAP_THEME.nodes,
        topic: {
          fillColor: '#131c2e',
          strokeColor: '#38bdf8',
          textColor: '#f8fafc',
          fontSize: 13.5,
          borderRadius: 8,
          strokeWidth: 1.5,
        },
        subtopic: {
          fillColor: '#0f172a',
          strokeColor: '#334155',
          textColor: '#cbd5e1',
          fontSize: 12.5,
          borderRadius: 6,
          strokeWidth: 1.2,
        },
        section: {
          fillColor: '#0c1322',
          strokeColor: '#1e293b',
          textColor: '#f8fafc',
          fontSize: 15.5,
          borderRadius: 12,
          strokeWidth: 1.5,
          titleOnBorder: true,
          borderTitlePaddingX: 14,
        },
        subsection: {
          fillColor: '#131c2e',
          strokeColor: '#334155',
          textColor: '#e2e8f0',
          fontSize: 13,
          borderRadius: 8,
          strokeWidth: 1.2,
          dashed: true,
          titleOnBorder: true,
          borderTitlePaddingX: 10,
        },
        milestone: {
          shape: 'pin',
          color: '#38bdf8',
          size: 28,
          showGroundShadow: true,
        },
      },
      edges: {
        ...DEFAULT_ROADMAP_THEME.edges,
        spine: {
          ...DEFAULT_ROADMAP_THEME.edges.spine,
          strokeColor: '#334155',
        },
        branch: {
          ...DEFAULT_ROADMAP_THEME.edges.branch,
          strokeColor: '#38bdf8',
        },
        subBranch: {
          ...DEFAULT_ROADMAP_THEME.edges.subBranch,
          strokeColor: '#1e293b',
        },
      },
      canvas: {
        ...DEFAULT_ROADMAP_THEME.canvas,
        backgroundColor: '#090d16',
        titleColor: '#f8fafc',
      },
    },
  },
};

/**
 * Resolves the active theme for rendering based on whether dark mode is selected.
 * If isDark is true and the given theme is light, returns an aesthetically matched dark theme.
 */
export function getEffectiveTheme(
  theme: RoadmapThemeConfig = DEFAULT_ROADMAP_THEME,
  isDark: boolean
): RoadmapThemeConfig {
  if (!isDark) {
    return theme;
  }

  // If the canvas background is already dark, keep the theme as is
  if (isDarkColor(theme.canvas.backgroundColor)) {
    return theme;
  }

  // 1. Soft Honey -> Warm Stone / Amber Dark
  if (
    theme.nodes.topic.strokeColor === '#f59e0b' ||
    theme.canvas.backgroundColor === '#fffdfa'
  ) {
    return {
      ...theme,
      canvas: {
        ...theme.canvas,
        backgroundColor: '#0c0a09',
        titleColor: '#fef3c7',
      },
      nodes: {
        ...theme.nodes,
        section: {
          ...theme.nodes.section,
          fillColor: '#141210',
          strokeColor: '#78350f',
          textColor: '#fef3c7',
        },
        subsection: {
          ...theme.nodes.subsection,
          fillColor: '#1c1917',
          strokeColor: '#92400e',
          textColor: '#fde68a',
        },
        topic: {
          ...theme.nodes.topic,
          fillColor: '#1c1917',
          strokeColor: '#f59e0b',
          textColor: '#fef3c7',
        },
        subtopic: {
          ...theme.nodes.subtopic,
          fillColor: '#141210',
          strokeColor: '#78350f',
          textColor: '#fde68a',
        },
        milestone: {
          ...theme.nodes.milestone,
          color: '#f59e0b',
        },
      },
      edges: {
        ...theme.edges,
        spine: { ...theme.edges.spine, strokeColor: '#78350f' },
        branch: { ...theme.edges.branch, strokeColor: '#f59e0b' },
        subBranch: { ...theme.edges.subBranch, strokeColor: '#92400e' },
      },
    };
  }

  // 2. Nordic Sage -> Fresh Emerald Dark
  if (
    theme.nodes.topic.strokeColor === '#10b981' ||
    theme.canvas.backgroundColor === '#f0fdf4'
  ) {
    return {
      ...theme,
      canvas: {
        ...theme.canvas,
        backgroundColor: '#02120b',
        titleColor: '#ecfdf5',
      },
      nodes: {
        ...theme.nodes,
        section: {
          ...theme.nodes.section,
          fillColor: '#041c12',
          strokeColor: '#065f46',
          textColor: '#ecfdf5',
        },
        subsection: {
          ...theme.nodes.subsection,
          fillColor: '#06281a',
          strokeColor: '#047857',
          textColor: '#a7f3d0',
        },
        topic: {
          ...theme.nodes.topic,
          fillColor: '#06281a',
          strokeColor: '#10b981',
          textColor: '#ecfdf5',
        },
        subtopic: {
          ...theme.nodes.subtopic,
          fillColor: '#041c12',
          strokeColor: '#065f46',
          textColor: '#a7f3d0',
        },
        milestone: {
          ...theme.nodes.milestone,
          color: '#10b981',
        },
      },
      edges: {
        ...theme.edges,
        spine: { ...theme.edges.spine, strokeColor: '#065f46' },
        branch: { ...theme.edges.branch, strokeColor: '#10b981' },
        subBranch: { ...theme.edges.subBranch, strokeColor: '#059669' },
      },
    };
  }

  // 3. Ocean Breeze -> Deep Ocean Navy Dark
  if (
    theme.nodes.topic.strokeColor === '#0284c7' ||
    theme.canvas.backgroundColor === '#f0f9ff'
  ) {
    return {
      ...theme,
      canvas: {
        ...theme.canvas,
        backgroundColor: '#030d1a',
        titleColor: '#f0f9ff',
      },
      nodes: {
        ...theme.nodes,
        section: {
          ...theme.nodes.section,
          fillColor: '#07182e',
          strokeColor: '#0c4a6e',
          textColor: '#f0f9ff',
        },
        subsection: {
          ...theme.nodes.subsection,
          fillColor: '#0a2342',
          strokeColor: '#0284c7',
          textColor: '#bae6fd',
        },
        topic: {
          ...theme.nodes.topic,
          fillColor: '#0a2342',
          strokeColor: '#38bdf8',
          textColor: '#f0f9ff',
        },
        subtopic: {
          ...theme.nodes.subtopic,
          fillColor: '#07182e',
          strokeColor: '#0369a1',
          textColor: '#bae6fd',
        },
        milestone: {
          ...theme.nodes.milestone,
          color: '#38bdf8',
        },
      },
      edges: {
        ...theme.edges,
        spine: { ...theme.edges.spine, strokeColor: '#0c4a6e' },
        branch: { ...theme.edges.branch, strokeColor: '#38bdf8' },
        subBranch: { ...theme.edges.subBranch, strokeColor: '#0284c7' },
      },
    };
  }

  // 4. Lavender Dream -> Deep Violet Dark
  if (
    theme.nodes.topic.strokeColor === '#9333ea' ||
    theme.canvas.backgroundColor === '#faf5ff'
  ) {
    return {
      ...theme,
      canvas: {
        ...theme.canvas,
        backgroundColor: '#0c0716',
        titleColor: '#faf5ff',
      },
      nodes: {
        ...theme.nodes,
        section: {
          ...theme.nodes.section,
          fillColor: '#140c24',
          strokeColor: '#581c87',
          textColor: '#faf5ff',
        },
        subsection: {
          ...theme.nodes.subsection,
          fillColor: '#1f1338',
          strokeColor: '#7e22ce',
          textColor: '#e9d5ff',
        },
        topic: {
          ...theme.nodes.topic,
          fillColor: '#1f1338',
          strokeColor: '#c084fc',
          textColor: '#faf5ff',
        },
        subtopic: {
          ...theme.nodes.subtopic,
          fillColor: '#140c24',
          strokeColor: '#6b21a8',
          textColor: '#e9d5ff',
        },
        milestone: {
          ...theme.nodes.milestone,
          color: '#c084fc',
        },
      },
      edges: {
        ...theme.edges,
        spine: { ...theme.edges.spine, strokeColor: '#581c87' },
        branch: { ...theme.edges.branch, strokeColor: '#c084fc' },
        subBranch: { ...theme.edges.subBranch, strokeColor: '#7e22ce' },
      },
    };
  }

  // 5. Paper & Ink -> Blackboard Sketch Dark
  if (
    theme.canvas.fontFamily.includes('Architects Daughter') ||
    theme.canvas.fontFamily.includes('Virgil')
  ) {
    return {
      ...theme,
      canvas: {
        ...theme.canvas,
        backgroundColor: '#0b0f17',
        titleColor: '#f8fafc',
      },
      nodes: {
        ...theme.nodes,
        section: {
          ...theme.nodes.section,
          fillColor: '#0f172a',
          strokeColor: '#94a3b8',
          textColor: '#f8fafc',
        },
        subsection: {
          ...theme.nodes.subsection,
          fillColor: '#1e293b',
          strokeColor: '#64748b',
          textColor: '#cbd5e1',
        },
        topic: {
          ...theme.nodes.topic,
          fillColor: '#1e293b',
          strokeColor: '#f8fafc',
          textColor: '#f8fafc',
        },
        subtopic: {
          ...theme.nodes.subtopic,
          fillColor: '#0f172a',
          strokeColor: '#94a3b8',
          textColor: '#cbd5e1',
        },
        milestone: {
          ...theme.nodes.milestone,
          color: '#ef4444',
        },
      },
      edges: {
        ...theme.edges,
        spine: { ...theme.edges.spine, strokeColor: '#475569' },
        branch: { ...theme.edges.branch, strokeColor: '#cbd5e1' },
        subBranch: { ...theme.edges.subBranch, strokeColor: '#64748b' },
      },
    };
  }

  // 6. Minimal Slate (Default) and any other light theme -> Midnight Pro / Sleek Dark
  return {
    ...theme,
    canvas: {
      ...theme.canvas,
      backgroundColor: '#090d16',
      titleColor: '#f8fafc',
    },
    nodes: {
      ...theme.nodes,
      section: {
        ...theme.nodes.section,
        fillColor: '#0c1322',
        strokeColor: '#1e293b',
        textColor: '#f8fafc',
      },
      subsection: {
        ...theme.nodes.subsection,
        fillColor: '#131c2e',
        strokeColor: '#334155',
        textColor: '#e2e8f0',
      },
      topic: {
        ...theme.nodes.topic,
        fillColor: '#131c2e',
        strokeColor:
          isDarkColor(theme.nodes.topic.strokeColor) ||
          theme.nodes.topic.strokeColor === '#0ea5e9'
            ? '#38bdf8'
            : theme.nodes.topic.strokeColor,
        textColor: '#f8fafc',
      },
      subtopic: {
        ...theme.nodes.subtopic,
        fillColor: '#0f172a',
        strokeColor: '#334155',
        textColor: '#cbd5e1',
      },
      milestone: {
        ...theme.nodes.milestone,
        color: '#38bdf8',
      },
    },
    edges: {
      ...theme.edges,
      spine: { ...theme.edges.spine, strokeColor: '#334155' },
      branch: {
        ...theme.edges.branch,
        strokeColor:
          isDarkColor(theme.edges.branch.strokeColor) ||
          theme.edges.branch.strokeColor === '#64748b'
            ? '#38bdf8'
            : theme.edges.branch.strokeColor,
      },
      subBranch: { ...theme.edges.subBranch, strokeColor: '#1e293b' },
    },
  };
}
