import {
  RoadmapStageSchema,
  RoadmapGraph,
  RoadmapNode,
  RoadmapEdge,
  RoadmapLayoutOverrides,
  RoadmapThemeConfig,
  TopicRequirementTag,
  toTopicSlugId,
} from '@/types/roadmap';
import { DEFAULT_ROADMAP_THEME } from '@/config/theme';
import { resolveEdgeControlPoints, getEdgePath } from '@/lib/svgEdgeUtils';

export function wrapTopicLabel(
  label: string,
  maxCharsPerLine: number
): string[] {
  const safeMax = Math.max(10, maxCharsPerLine);
  if (label.length <= safeMax) return [label];

  const words = label.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? current + ' ' + word : word;
    if (candidate.length > safeMax && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function computeBoundingBox(nodes: RoadmapNode[], pad = 44) {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, width: 1360, height: 1800 };
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const n of nodes) {
    if (n.x < minX) minX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.x + n.width > maxX) maxX = n.x + n.width;
    if (n.y + n.height > maxY) maxY = n.y + n.height;
  }

  return {
    minX: Math.floor(minX - pad),
    minY: Math.floor(minY - pad),
    width: Math.ceil(maxX - minX + pad * 2),
    height: Math.ceil(maxY - minY + pad * 2),
  };
}

/**
 * Computes all vector geometry, edge spline paths (d), border cutout masks,
 * and text baseline positions so that the SVG view remains a purely declarative
 * template with zero math calculations at render time.
 */
export function computeRenderGeometry(
  graph: RoadmapGraph,
  theme: RoadmapThemeConfig = DEFAULT_ROADMAP_THEME
): RoadmapGraph {
  const order: Record<string, number> = {
    section: 0,
    subsection: 1,
    milestone: 2,
    title: 2,
    topic: 3,
    subtopic: 3,
  };

  const updatedNodes = graph.nodes.map((node) => {
    const centerX = Math.round(node.x + node.width / 2);
    const centerY = Math.round(node.y + node.height / 2);

    if (node.type === 'section' || node.type === 'subsection') {
      const isSub = node.type === 'subsection';
      const boxStyle = isSub ? theme.nodes.subsection : theme.nodes.section;
      const titleOnBorder = boxStyle.titleOnBorder ?? true;
      const padX = boxStyle.borderTitlePaddingX ?? 14;
      const estTextW = node.label
        ? Math.ceil(node.label.length * (boxStyle.fontSize * 0.6))
        : 0;
      const maskW = estTextW + padX * 2;
      const maskX = Math.round(centerX - maskW / 2);
      const borderMask =
        node.label && titleOnBorder
          ? {
              x: maskX,
              y: node.y - 10,
              width: maskW,
              height: 20,
            }
          : undefined;

      const titleY = titleOnBorder ? node.y : node.y + (isSub ? 20 : 23);

      return {
        ...node,
        centerX,
        centerY,
        titleY,
        borderMask,
      };
    }

    if (node.type === 'topic' || node.type === 'subtopic') {
      const isSubtopic = node.type === 'subtopic';
      const baseBoxStyle = isSubtopic
        ? theme.nodes.subtopic
        : theme.nodes.topic;

      const titleLines =
        node.lines && node.lines.length > 0 ? node.lines : [node.label];
      const hasSubtext = Boolean(node.subtext && node.subtext.length > 0);
      const fontSize = baseBoxStyle.fontSize;
      const lineSpacing = Math.round(fontSize * 1.2);
      const titleBlockHeight = (titleLines.length - 1) * lineSpacing;
      const firstTitleY = hasSubtext
        ? node.y + 18
        : Math.round(node.y + node.height / 2 - titleBlockHeight / 2);

      const renderedLines = titleLines.map((line, lIdx) => ({
        text: line,
        y: firstTitleY + lIdx * lineSpacing,
      }));

      const renderedSubtext = node.subtext?.map((subLine, sIdx) => ({
        text: subLine,
        y: firstTitleY + titleLines.length * lineSpacing + 6 + sIdx * 15,
      }));

      return {
        ...node,
        centerX,
        centerY,
        renderedLines,
        renderedSubtext,
        badgeX: node.x + node.width - 6,
        badgeY: node.y + 6,
      };
    }

    return {
      ...node,
      centerX,
      centerY,
    };
  });

  // Layer order: sections & subsections (0, 1), milestones & titles (2), topics & subtopics (3)
  const sortedNodes = [...updatedNodes].sort(
    (a, b) => (order[a.type] ?? 3) - (order[b.type] ?? 3)
  );

  const updatedNodeMap = new Map(sortedNodes.map((n) => [n.id, n]));

  const updatedEdges = graph.edges.map((edge) => {
    const edgeCfg =
      edge.type === 'spine-edge'
        ? theme.edges.spine
        : edge.type === 'sub-branch-edge'
          ? theme.edges.subBranch
          : theme.edges.branch;

    const controlPoints = resolveEdgeControlPoints(
      edge,
      updatedNodeMap,
      edgeCfg.controlPointsCount
    );
    const d = getEdgePath(edge, updatedNodeMap, edgeCfg.curveStyle, controlPoints) || '';

    return {
      ...edge,
      d,
    };
  });

  const viewBox = `${graph.minX} ${graph.minY} ${graph.width} ${graph.height}`;

  return {
    ...graph,
    viewBox,
    nodes: sortedNodes,
    edges: updatedEdges,
  };
}

export function applyLayoutOverrides(
  baseGraph: RoadmapGraph,
  overrides?: RoadmapLayoutOverrides,
  theme: RoadmapThemeConfig = DEFAULT_ROADMAP_THEME
): RoadmapGraph {
  if (!overrides) return computeRenderGeometry(baseGraph, theme);

  const removedSet = new Set(overrides.removedEdgeIds || []);
  const tagMap = overrides.topicTags || {};

  const updatedNodes = baseGraph.nodes.map((node) => {
    const ov = overrides.nodeOffsets?.[node.id];
    const customTag = tagMap[node.topicId] ?? tagMap[node.label] ?? node.tag ?? 'none';
    const label =
      node.id === 'roadmap-main-title' && overrides.canvasTitle !== undefined
        ? (overrides.canvasTitle.trim() || node.label)
        : node.label;
    return {
      ...node,
      label,
      tag: customTag,
      x: ov ? Math.round(node.x + (ov.dx || 0)) : node.x,
      y: ov ? Math.round(node.y + (ov.dy || 0)) : node.y,
      width: ov?.width ?? node.width,
      height: ov?.height ?? node.height,
    };
  });

  const baseEdges = baseGraph.edges
    .filter((e) => !removedSet.has(e.id))
    .map((edge) => {
      const customPts = overrides.edgePoints?.[edge.id];
      if (!customPts) return edge;
      return { ...edge, points: customPts };
    });

  const allEdges = [...baseEdges, ...(overrides.customEdges || [])];
  const bounds = computeBoundingBox(updatedNodes, 44);

  const resultingGraph: RoadmapGraph = {
    minX: bounds.minX,
    minY: bounds.minY,
    width: bounds.width,
    height: bounds.height,
    nodes: updatedNodes,
    edges: allEdges,
  };

  return computeRenderGeometry(resultingGraph, theme);
}

export function buildRoadmapFromSchema(
  title: string,
  stages: RoadmapStageSchema[],
  overrides?: RoadmapLayoutOverrides,
  theme: RoadmapThemeConfig = DEFAULT_ROADMAP_THEME
): RoadmapGraph {
  const nodes: RoadmapNode[] = [];
  const edges: RoadmapEdge[] = [];

  const SPINE_X = 680;
  const BRANCH_GAP = theme.canvas.spineBranchGap ?? 68;
  const TOPIC_GAP = theme.canvas.topicGap ?? 14;
  const SUBTOPIC_GAP = theme.canvas.subTopicGap ?? 12;
  const PAD_X = theme.canvas.sectionPadding ?? 20;
  const HEADER_H = 24;
  const PAD_BOTTOM = Math.max(16, Math.round(PAD_X * 0.85));
  const SECTION_V_GAP = theme.canvas.stageVerticalGap ?? 48;
  const SUBSECTION_GAP = theme.canvas.subSectionGap ?? 30;

  const topicFontPx = theme.nodes.topic.fontSize || 13.5;
  const subtopicFontPx = theme.nodes.subtopic.fontSize || 12.5;
  const charWidthTopic = topicFontPx * 0.58;
  const charWidthSubtopic = subtopicFontPx * 0.57;

  let leftY = 115;
  let rightY = 115;
  let lastMilestoneY = 75;

  const displayTitle = overrides?.canvasTitle?.trim() || title;
  const titleId = 'roadmap-main-title';
  nodes.push({
    id: titleId,
    topicId: toTopicSlugId(displayTitle),
    label: displayTitle,
    type: 'title',
    clickable: false,
    x: SPINE_X - 200,
    y: 24,
    width: 424,
    height: 42,
  });

  let prevSpineId = titleId;

  function placeMilestone(
    id: string,
    stageId: string,
    preferredY: number
  ): number {
    const milestoneY = Math.max(preferredY, lastMilestoneY + 46);
    lastMilestoneY = milestoneY;

    nodes.push({
      id,
      topicId: id,
      stageId,
      label: '',
      type: 'milestone',
      clickable: false,
      x: SPINE_X,
      y: milestoneY - 12,
      width: 24,
      height: 24,
    });

    edges.push({
      id: 'spine-to-' + id,
      source: prevSpineId,
      target: id,
      type: 'spine-edge',
    });
    prevSpineId = id;
    return milestoneY;
  }

  stages.forEach((stage) => {
    const milestoneId = 'milestone-' + stage.id;
    const isLeft = stage.side === 'left';

    const otherTrackY = isLeft ? rightY : leftY;
    let trackY = isLeft ? leftY : rightY;
    if (trackY < otherTrackY - 220) {
      trackY = otherTrackY - 140;
    }

    if (stage.standaloneTopic && stage.topics && stage.topics.length > 0) {
      const raw = stage.topics[0];
      const label = typeof raw === 'string' ? raw : raw.label;
      const tag: TopicRequirementTag =
        typeof raw === 'string' ? 'none' : raw.tag || 'none';
      const boxW = Math.max(210, Math.ceil(label.length * charWidthTopic) + 44);
      const boxH = 38;
      const boxX = isLeft
        ? SPINE_X - BRANCH_GAP - boxW
        : SPINE_X + 24 + BRANCH_GAP;

      const mY = placeMilestone(milestoneId, stage.id, trackY + boxH / 2);
      const actualY = Math.max(trackY, mY - boxH / 2);

      const topicId = 'topic-' + stage.id;
      nodes.push({
        id: topicId,
        topicId: toTopicSlugId(label),
        stageId: stage.id,
        label,
        lines: [label],
        tag,
        type: 'topic',
        clickable: true,
        x: boxX,
        y: actualY,
        width: boxW,
        height: boxH,
      });

      edges.push({
        id: 'branch-' + stage.id,
        source: milestoneId,
        target: topicId,
        type: 'branch-edge',
      });

      if (isLeft) leftY = actualY + boxH + SECTION_V_GAP;
      else rightY = actualY + boxH + SECTION_V_GAP;
      return;
    }

    if (stage.groups && stage.groups.length > 0) {
      const cols = stage.columns || 3;
      const groupW = 166;
      const groupPad = 12;
      const subItemH = 30;
      const maxTopicsInGroup = Math.max(
        ...stage.groups.map((g) => g.topics.length),
        1
      );
      const groupH =
        38 +
        maxTopicsInGroup * subItemH +
        Math.max(0, maxTopicsInGroup - 1) * SUBTOPIC_GAP +
        14;
      const groupRows = Math.ceil(stage.groups.length / cols);

      const secW = cols * groupW + (cols - 1) * TOPIC_GAP + PAD_X * 2;
      const secH =
        HEADER_H + groupRows * groupH + (groupRows - 1) * TOPIC_GAP + PAD_BOTTOM;
      const secX = isLeft
        ? SPINE_X - BRANCH_GAP - secW
        : SPINE_X + 24 + BRANCH_GAP;

      placeMilestone(milestoneId, stage.id, trackY + 42);

      const secId = 'sec-' + stage.id;
      nodes.push({
        id: secId,
        topicId: toTopicSlugId(stage.title || stage.id),
        stageId: stage.id,
        label: stage.title || '',
        type: 'section',
        clickable: false,
        x: secX,
        y: trackY,
        width: secW,
        height: secH,
      });

      edges.push({
        id: 'branch-' + stage.id,
        source: milestoneId,
        target: secId,
        type: 'branch-edge',
      });

      stage.groups.forEach((grp, gIdx) => {
        const r = Math.floor(gIdx / cols);
        const c = gIdx % cols;
        const gx = secX + PAD_X + c * (groupW + TOPIC_GAP);
        const gy = trackY + HEADER_H + r * (groupH + TOPIC_GAP);
        const grpId = 'subsec-' + grp.id;

        nodes.push({
          id: grpId,
          topicId: toTopicSlugId(grp.title || grp.id),
          parentId: secId,
          stageId: stage.id,
          label: grp.title,
          type: 'subsection',
          clickable: false,
          x: gx,
          y: gy,
          width: groupW,
          height: groupH,
        });

        grp.topics.forEach((tLabel, tIdx) => {
          nodes.push({
            id: 'topic-' + grp.id + '-' + tIdx,
            topicId: toTopicSlugId(tLabel),
            parentId: secId,
            stageId: stage.id,
            label: tLabel,
            lines: wrapTopicLabel(
              tLabel,
              Math.floor((groupW - groupPad * 2 - 14) / charWidthSubtopic)
            ),
            tag: 'none',
            type: 'subtopic',
            clickable: true,
            x: gx + groupPad,
            y: gy + 36 + tIdx * (subItemH + SUBTOPIC_GAP),
            width: groupW - groupPad * 2,
            height: subItemH,
          });
        });
      });

      if (isLeft) leftY = trackY + secH + SECTION_V_GAP;
      else rightY = trackY + secH + SECTION_V_GAP;
      return;
    }

    const topics = stage.topics || [];
    const cols = stage.columns || 2;

    const colW = cols === 3 ? 162 : cols === 2 ? 244 : 380;
    const maxCharsPerLine = Math.floor((colW - 26) / charWidthTopic);
    const totalRows = Math.ceil(topics.length / cols);

    const preparedTopics = topics.map((raw) => {
      const label = typeof raw === 'string' ? raw : raw.label;
      const subtext = typeof raw === 'string' ? undefined : raw.subtext;
      const tag: TopicRequirementTag =
        typeof raw === 'string' ? 'none' : raw.tag || 'none';
      const lines = wrapTopicLabel(label, maxCharsPerLine);
      const baseH = lines.length > 1 ? 22 + lines.length * 17 : 36;
      const subH =
        subtext && subtext.length > 0 ? subtext.length * 16 + 12 : 0;
      return {
        label,
        lines,
        subtext,
        tag,
        height: baseH + subH,
      };
    });

    const rowHeights: number[] = [];
    for (let r = 0; r < totalRows; r++) {
      const rowItems = preparedTopics.slice(r * cols, (r + 1) * cols);
      rowHeights.push(Math.max(...rowItems.map((it) => it.height), 36));
    }

    const totalRowsHeight =
      rowHeights.reduce((acc, h) => acc + h, 0) +
      Math.max(0, totalRows - 1) * TOPIC_GAP;

    const secW = cols * colW + (cols - 1) * TOPIC_GAP + PAD_X * 2;
    const secH = HEADER_H + totalRowsHeight + PAD_BOTTOM;
    const secX = isLeft
      ? SPINE_X - BRANCH_GAP - secW
      : SPINE_X + 24 + BRANCH_GAP;

    placeMilestone(milestoneId, stage.id, trackY + 42);

    const secId = 'sec-' + stage.id;
    nodes.push({
      id: secId,
      topicId: toTopicSlugId(stage.title || stage.id),
      stageId: stage.id,
      label: stage.title || '',
      type: 'section',
      clickable: false,
      x: secX,
      y: trackY,
      width: secW,
      height: secH,
    });

    edges.push({
      id: 'branch-' + stage.id,
      source: milestoneId,
      target: secId,
      type: 'branch-edge',
    });

    const topicNodeByLabel = new Map<string, string>();
    let cumulativeRowY = trackY + HEADER_H;

    for (let r = 0; r < totalRows; r++) {
      const rowItems = preparedTopics.slice(r * cols, (r + 1) * cols);
      const rowH = rowHeights[r];

      rowItems.forEach((item, cIdx) => {
        const tIdx = r * cols + cIdx;
        const isSingleTrailing = rowItems.length === 1 && cols > 1;
        const itemW = isSingleTrailing
          ? cols * colW + (cols - 1) * TOPIC_GAP
          : colW;
        const tx = isSingleTrailing
          ? secX + PAD_X
          : secX + PAD_X + cIdx * (colW + TOPIC_GAP);

        const tId = 'topic-' + stage.id + '-' + tIdx;
        nodes.push({
          id: tId,
          topicId: toTopicSlugId(item.label),
          parentId: secId,
          stageId: stage.id,
          label: item.label,
          lines: isSingleTrailing
            ? wrapTopicLabel(
              item.label,
              Math.floor((itemW - 26) / charWidthTopic)
            )
            : item.lines,
          subtext: item.subtext,
          tag: item.tag,
          type: 'topic',
          clickable: true,
          x: tx,
          y: cumulativeRowY,
          width: itemW,
          height: rowH,
        });

        topicNodeByLabel.set(item.label, tId);
      });

      cumulativeRowY += rowH + TOPIC_GAP;
    }

    let currentTrackCursor = trackY + secH;

    if (stage.subSections && stage.subSections.length > 0) {
      stage.subSections.forEach((sub) => {
        const subTopY = currentTrackCursor + SUBSECTION_GAP;
        const subCols = sub.columns || 2;
        const indent = 18;
        const subW = secW - indent * 2;
        const subX = secX + indent;
        const subPadX = Math.max(14, PAD_X - 4);
        const subColW = Math.floor(
          (subW - subPadX * 2 - (subCols - 1) * SUBTOPIC_GAP) / subCols
        );
        const subMaxChars = Math.floor((subColW - 22) / charWidthSubtopic);

        const subPrepared = sub.topics.map((raw) => {
          const sLabel = typeof raw === 'string' ? raw : raw.label;
          const sTag: TopicRequirementTag =
            typeof raw === 'string' ? 'none' : raw.tag || 'none';
          const sLines = wrapTopicLabel(sLabel, subMaxChars);
          return {
            label: sLabel,
            lines: sLines,
            tag: sTag,
            height: sLines.length > 1 ? 20 + sLines.length * 16 : 32,
          };
        });

        const subTotalRows = Math.ceil(subPrepared.length / subCols);
        const subRowHeights: number[] = [];
        for (let sr = 0; sr < subTotalRows; sr++) {
          const rItems = subPrepared.slice(sr * subCols, (sr + 1) * subCols);
          subRowHeights.push(Math.max(...rItems.map((i) => i.height), 32));
        }

        const subRowsH =
          subRowHeights.reduce((a, b) => a + b, 0) +
          Math.max(0, subTotalRows - 1) * SUBTOPIC_GAP;
        const subHeaderH = sub.title ? 38 : 14;
        const subH = subHeaderH + subRowsH + 16;

        const subSecId = 'subsec-' + sub.id;
        nodes.push({
          id: subSecId,
          topicId: toTopicSlugId(sub.title || sub.id),
          stageId: stage.id,
          label: sub.title || '',
          type: 'subsection',
          clickable: false,
          x: subX,
          y: subTopY,
          width: subW,
          height: subH,
        });

        const sourceId =
          (sub.fromTopic && topicNodeByLabel.get(sub.fromTopic)) || secId;

        edges.push({
          id: 'subedge-' + sub.id,
          source: sourceId,
          target: subSecId,
          type: 'sub-branch-edge',
        });

        let subRowY = subTopY + subHeaderH;
        for (let sr = 0; sr < subTotalRows; sr++) {
          const rItems = subPrepared.slice(sr * subCols, (sr + 1) * subCols);
          const sRowH = subRowHeights[sr];

          rItems.forEach((sItem, scIdx) => {
            const stIdx = sr * subCols + scIdx;
            const isTrailingSingle = rItems.length === 1 && subCols > 1;
            const sItemW = isTrailingSingle
              ? subCols * subColW + (subCols - 1) * SUBTOPIC_GAP
              : subColW;
            const stX = isTrailingSingle
              ? subX + subPadX
              : subX + subPadX + scIdx * (subColW + SUBTOPIC_GAP);

            nodes.push({
              id: 'topic-' + sub.id + '-' + stIdx,
              topicId: toTopicSlugId(sItem.label),
              parentId: subSecId,
              stageId: stage.id,
              label: sItem.label,
              lines: sItem.lines,
              tag: sItem.tag,
              type: 'subtopic',
              clickable: true,
              x: stX,
              y: subRowY,
              width: sItemW,
              height: sRowH,
            });
          });

          subRowY += sRowH + SUBTOPIC_GAP;
        }

        currentTrackCursor = subTopY + subH;
      });
    }

    if (isLeft) leftY = currentTrackCursor + SECTION_V_GAP;
    else rightY = currentTrackCursor + SECTION_V_GAP;
  });

  const finalY = Math.max(leftY, rightY, lastMilestoneY + 50) + 16;
  const footerId = 'roadmap-footer';
  nodes.push({
    id: footerId,
    topicId: 'keep_learning',
    label: 'Keep Learning :)',
    type: 'title',
    clickable: false,
    x: SPINE_X - 110,
    y: finalY,
    width: 244,
    height: 38,
  });

  edges.push({
    id: 'spine-footer',
    source: prevSpineId,
    target: footerId,
    type: 'spine-edge',
  });

  const bounds = computeBoundingBox(nodes, 44);

  const baseGraph: RoadmapGraph = {
    minX: bounds.minX,
    minY: bounds.minY,
    width: bounds.width,
    height: bounds.height,
    nodes,
    edges,
  };

  return applyLayoutOverrides(baseGraph, overrides, theme);
}
