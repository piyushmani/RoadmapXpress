import {
  RoadmapStageSchema,
  RoadmapGraph,
  RoadmapNode,
  RoadmapEdge,
} from '../types/roadmap';

// Splits a label into multiple lines if it exceeds maxCharsPerLine
export function wrapTopicLabel(label: string, maxCharsPerLine: number): string[] {
  if (label.length <= maxCharsPerLine) return [label];
  const words = label.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? current + ' ' + word : word;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function computeBoundingBox(nodes: RoadmapNode[], pad = 28) {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, width: 1200, height: 1800 };
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

export function buildRoadmapFromSchema(
  title: string,
  stages: RoadmapStageSchema[]
): RoadmapGraph {
  const nodes: RoadmapNode[] = [];
  const edges: RoadmapEdge[] = [];

  const SPINE_X = 620;
  const BRANCH_GAP = 42;
  const SUB_GAP = 24;
  const GAP = 10;
  const PAD_X = 14;
  const HEADER_H = 36;
  const PAD_BOTTOM = 14;
  const SECTION_V_GAP = 22;

  // Dual-track vertical cursors so Left and Right sides pack concurrently!
  let leftY = 105;
  let rightY = 105;
  let lastMilestoneY = 75;

  const titleId = 'roadmap-main-title';
  nodes.push({
    id: titleId,
    label: title,
    type: 'title',
    clickable: false,
    x: SPINE_X - 130,
    y: 28,
    width: 284,
    height: 36,
  });

  let prevSpineId = titleId;

  function placeMilestone(id: string, preferredY: number): number {
    const milestoneY = Math.max(preferredY, lastMilestoneY + 34);
    lastMilestoneY = milestoneY;

    nodes.push({
      id,
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
    const trackY = isLeft ? leftY : rightY;

    // 1. Standalone Pill Topic (CI/CD, WebSocket, Server Sent Events)
    if (stage.standaloneTopic && stage.topics && stage.topics.length > 0) {
      const raw = stage.topics[0];
      const label = typeof raw === 'string' ? raw : raw.label;
      const boxW = Math.max(175, label.length * 8 + 32);
      const boxH = 32;
      const boxX = isLeft
        ? SPINE_X - BRANCH_GAP - boxW
        : SPINE_X + 24 + BRANCH_GAP;

      const mY = placeMilestone(milestoneId, trackY + boxH / 2);
      const actualY = Math.max(trackY, mY - boxH / 2);

      const topicId = 'topic-' + stage.id;
      nodes.push({
        id: topicId,
        label,
        lines: [label],
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

    // 2. Grouped Sub-Containers (NoSQL Databases)
    if (stage.groups && stage.groups.length > 0) {
      const cols = stage.columns || 3;
      const groupW = 142;
      const groupH = 106;
      const groupRows = Math.ceil(stage.groups.length / cols);

      const secW = cols * groupW + (cols - 1) * GAP + PAD_X * 2;
      const secH =
        HEADER_H + groupRows * groupH + (groupRows - 1) * GAP + PAD_BOTTOM;
      const secX = isLeft
        ? SPINE_X - BRANCH_GAP - secW
        : SPINE_X + 24 + BRANCH_GAP;

      placeMilestone(milestoneId, trackY + Math.min(70, secH / 2));

      const secId = 'sec-' + stage.id;
      nodes.push({
        id: secId,
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
        const gx = secX + PAD_X + c * (groupW + GAP);
        const gy = trackY + HEADER_H + r * (groupH + GAP);

        nodes.push({
          id: 'subsec-' + grp.id,
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
            label: tLabel,
            lines: [tLabel],
            type: 'topic',
            clickable: true,
            x: gx + 10,
            y: gy + 32 + tIdx * 33,
            width: groupW - 20,
            height: 26,
          });
        });
      });

      if (isLeft) leftY = trackY + secH + SECTION_V_GAP;
      else rightY = trackY + secH + SECTION_V_GAP;
      return;
    }

    // 3. Standard Section with Per-Row Heights & Adaptive Column Widths
    const topics = stage.topics || [];
    const cols = stage.columns || 1;
    const hasSideSub = stage.subSections && stage.subSections.length > 0;

    // Choose column width so text fits cleanly while keeping subsections inside page bounds
    const colW =
      cols === 3
        ? 126
        : cols === 2
          ? hasSideSub
            ? 156
            : 192
          : hasSideSub
            ? 175
            : 215;

    const maxChars = Math.floor((colW - 18) / 7.1);
    const totalRows = Math.ceil(topics.length / cols);

    // Precompute wrapped lines and exact height for every row
    const preparedTopics = topics.map((raw) => {
      const label = typeof raw === 'string' ? raw : raw.label;
      const subtext = typeof raw === 'string' ? undefined : raw.subtext;
      const lines = wrapTopicLabel(label, maxChars);
      const baseH = lines.length > 1 ? 20 + lines.length * 15 : 30;
      const subH = subtext && subtext.length > 0 ? subtext.length * 15 + 8 : 0;
      return {
        label,
        lines,
        subtext,
        height: baseH + subH,
      };
    });

    const rowHeights: number[] = [];
    for (let r = 0; r < totalRows; r++) {
      const rowItems = preparedTopics.slice(r * cols, (r + 1) * cols);
      const maxH = Math.max(...rowItems.map((it) => it.height), 30);
      rowHeights.push(maxH);
    }

    const totalRowsHeight =
      rowHeights.reduce((acc, h) => acc + h, 0) +
      Math.max(0, totalRows - 1) * GAP;

    const secW = cols * colW + (cols - 1) * GAP + PAD_X * 2;
    const secH = HEADER_H + totalRowsHeight + PAD_BOTTOM;
    const secX = isLeft
      ? SPINE_X - BRANCH_GAP - secW
      : SPINE_X + 24 + BRANCH_GAP;

    placeMilestone(milestoneId, trackY + Math.min(65, secH / 2));

    const secId = 'sec-' + stage.id;
    nodes.push({
      id: secId,
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
        // If last row has fewer items than columns, span/center cleanly
        const isSingleTrailing = rowItems.length === 1 && cols > 1;
        const itemW = isSingleTrailing
          ? cols * colW + (cols - 1) * GAP
          : colW;
        const tx = isSingleTrailing
          ? secX + PAD_X
          : secX + PAD_X + cIdx * (colW + GAP);

        const tId = 'topic-' + stage.id + '-' + tIdx;
        nodes.push({
          id: tId,
          label: item.label,
          lines: item.lines,
          subtext: item.subtext,
          type: 'topic',
          clickable: true,
          x: tx,
          y: cumulativeRowY,
          width: itemW,
          height: rowH,
        });

        topicNodeByLabel.set(item.label, tId);
      });

      cumulativeRowY += rowH + GAP;
    }

    // 4. Render Attached Sub-Sections (Adaptive width + zero overflow)
    let maxSectionBottom = trackY + secH;
    if (stage.subSections && stage.subSections.length > 0) {
      let subCursorY = trackY;

      stage.subSections.forEach((sub) => {
        const subCols = sub.columns || 1;
        // Adaptive width based on longest topic inside the subsection
        const longestSubChars = Math.max(
          ...sub.topics.map((t) =>
            (typeof t === 'string' ? t : t.label).length
          ),
          12
        );
        const subColW =
          subCols === 2
            ? Math.max(105, Math.min(135, longestSubChars * 7.2 + 20))
            : Math.max(145, Math.min(205, longestSubChars * 7.4 + 24));

        const subMaxChars = Math.floor((subColW - 16) / 7.0);
        const subPrepared = sub.topics.map((raw) => {
          const sLabel = typeof raw === 'string' ? raw : raw.label;
          const sLines = wrapTopicLabel(sLabel, subMaxChars);
          return {
            label: sLabel,
            lines: sLines,
            height: sLines.length > 1 ? 18 + sLines.length * 15 : 28,
          };
        });

        const subTotalRows = Math.ceil(subPrepared.length / subCols);
        const subRowHeights: number[] = [];
        for (let sr = 0; sr < subTotalRows; sr++) {
          const rItems = subPrepared.slice(sr * subCols, (sr + 1) * subCols);
          subRowHeights.push(Math.max(...rItems.map((i) => i.height), 28));
        }

        const subRowsH =
          subRowHeights.reduce((a, b) => a + b, 0) +
          Math.max(0, subTotalRows - 1) * 8;
        const subHeaderH = sub.title ? 34 : 12;
        const subW =
          subCols * subColW + (subCols - 1) * 8 + PAD_X * 2;
        const subH = subHeaderH + subRowsH + 12;

        const subX =
          sub.side === 'left'
            ? secX - SUB_GAP - subW
            : secX + secW + SUB_GAP;

        const subSecId = 'subsec-' + sub.id;
        nodes.push({
          id: subSecId,
          label: sub.title || '',
          type: 'subsection',
          clickable: false,
          x: subX,
          y: subCursorY,
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

        let subRowY = subCursorY + subHeaderH;
        for (let sr = 0; sr < subTotalRows; sr++) {
          const rItems = subPrepared.slice(sr * subCols, (sr + 1) * subCols);
          const sRowH = subRowHeights[sr];

          rItems.forEach((sItem, scIdx) => {
            const stIdx = sr * subCols + scIdx;
            const isTrailingSingle = rItems.length === 1 && subCols > 1;
            const sItemW = isTrailingSingle
              ? subCols * subColW + (subCols - 1) * 8
              : subColW;
            const stX = isTrailingSingle
              ? subX + PAD_X
              : subX + PAD_X + scIdx * (subColW + 8);

            nodes.push({
              id: 'topic-' + sub.id + '-' + stIdx,
              label: sItem.label,
              lines: sItem.lines,
              type: 'topic',
              clickable: true,
              x: stX,
              y: subRowY,
              width: sItemW,
              height: sRowH,
            });
          });

          subRowY += sRowH + 8;
        }

        subCursorY += subH + 12;
        maxSectionBottom = Math.max(maxSectionBottom, subCursorY - 12);
      });
    }

    if (isLeft) leftY = maxSectionBottom + SECTION_V_GAP;
    else rightY = maxSectionBottom + SECTION_V_GAP;
  });

  // Footer Node below both tracks
  const finalY = Math.max(leftY, rightY, lastMilestoneY + 40) + 10;
  const footerId = 'roadmap-footer';
  nodes.push({
    id: footerId,
    label: 'Keep Learning :)',
    type: 'title',
    clickable: false,
    x: SPINE_X - 100,
    y: finalY,
    width: 224,
    height: 34,
  });

  edges.push({
    id: 'spine-footer',
    source: prevSpineId,
    target: footerId,
    type: 'spine-edge',
  });

  const bounds = computeBoundingBox(nodes, 28);

  return {
    minX: bounds.minX,
    minY: bounds.minY,
    width: bounds.width,
    height: bounds.height,
    nodes,
    edges,
  };
}
