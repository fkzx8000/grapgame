// GraphGame/EdgeUndirected.tsx
/**
 * קומפוננטת EdgeUndirected:
 * - מציגה קשת (קו) בגרף לא מכוון.
 * - אם הפרופ "highlighted" הוא true – הצלע יוצגת באדום.
 * - מציגה את המשקל (weight) במרכז הקו.
 */
import React from "react";
import { NodeType, EdgeType } from "./GraphCanvasTypes";
import "./GraphGame.css";

interface EdgeProps {
  edge: EdgeType;
  nodes: NodeType[];
  fontSizeEdgeLabel: number;
  offsetEdgeLabel: number;
  highlighted: boolean;
  onClick?: (edgeId: number) => void;
}

const EdgeUndirected: React.FC<EdgeProps> = ({
  edge,
  nodes,
  fontSizeEdgeLabel,
  offsetEdgeLabel,
  highlighted,
  onClick,
}) => {
  const fromNode = nodes.find((n) => n.id === edge.from);
  const toNode = nodes.find((n) => n.id === edge.to);
  if (!fromNode || !toNode) return null;

  const strokeColor = highlighted ? "red" : "black";
  const strokeWidth = highlighted ? 5 : 2;
  const midX = (fromNode.x + toNode.x) / 2;
  const midY = (fromNode.y + toNode.y) / 2;

  return (
    <g onClick={() => onClick && onClick(edge.id)}>
      <line
        x1={fromNode.x}
        y1={fromNode.y}
        x2={toNode.x}
        y2={toNode.y}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      <text
        x={midX}
        y={midY + offsetEdgeLabel}
        fill="red"
        fontSize={fontSizeEdgeLabel}
        textAnchor="middle"
      >
        {edge.weight}
      </text>
    </g>
  );
};

export default EdgeUndirected;
