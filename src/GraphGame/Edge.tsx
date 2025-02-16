// GraphGame/Edge.tsx
//
// קומפוננטה המציגה צלע. אם זו צלע בין שני קודקודים שונים, מציגה קשת מעוגלת
// (אחת כלפי מעלה או מטה - לפי סדר ה-id) עם חץ בסופה, ועליה טקסט של flow/capacity.
// אם זו צלע מלולאת עצמית (from === to) מציגים קו ישר (או אפשר לצייר לולאה).

import React from "react";
import { NodeType, EdgeType } from "./GraphCanvasTypes";
import "./GraphGame.css";

interface EdgeProps {
  edge: EdgeType;
  nodes: NodeType[];
  fontSizeEdgeLabel: number;
  offsetEdgeLabel: number;
  highlighted: boolean; // האם הצלע מודגשת (למשל בפתרון אוטומטי)
}

const Edge: React.FC<EdgeProps> = ({
  edge,
  nodes,
  fontSizeEdgeLabel,
  offsetEdgeLabel,
  highlighted,
}) => {
  const fromNode = nodes.find((n) => n.id === edge.from);
  const toNode = nodes.find((n) => n.id === edge.to);
  if (!fromNode || !toNode) return null;

  const strokeWidth = highlighted ? 5 : 2;

  // אם הצלע איננה לולאה
  if (edge.from !== edge.to) {
    // מחשבים קשת לפי וקטור מאונך
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const offset = 20;
    const nx = -dy / length;
    const ny = dx / length;
    // אם from < to => קשת כלפי מעלה, אחרת כלפי מטה
    const sign = edge.from < edge.to ? +1 : -1;
    const cx = (fromNode.x + toNode.x) / 2 + sign * nx * offset;
    const cy = (fromNode.y + toNode.y) / 2 + sign * ny * offset;
    const pathD = `M ${fromNode.x},${fromNode.y} Q ${cx},${cy} ${toNode.x},${toNode.y}`;

    return (
      <g>
        <path
          d={pathD}
          fill="none"
          stroke="black"
          strokeWidth={strokeWidth}
          markerEnd="url(#arrow)"
          id={`edge-${edge.id}`}
        />
        <text fill="red" fontSize={fontSizeEdgeLabel}>
          <textPath
            href={`#edge-${edge.id}`}
            startOffset="50%"
            textAnchor="middle"
          >
            {edge.flow}/{edge.capacity}
          </textPath>
        </text>
      </g>
    );
  } else {
    // אם זו לולאה
    return (
      <g>
        <line
          x1={fromNode.x}
          y1={fromNode.y}
          x2={toNode.x}
          y2={toNode.y}
          stroke="black"
          strokeWidth={strokeWidth}
          markerEnd="url(#arrow)"
        />
        <text
          x={(fromNode.x + toNode.x) / 2}
          y={(fromNode.y + toNode.y) / 2 + offsetEdgeLabel}
          fill="red"
          fontSize={fontSizeEdgeLabel}
          textAnchor="middle"
        >
          {edge.flow}/{edge.capacity}
        </text>
      </g>
    );
  }
};

export default Edge;
