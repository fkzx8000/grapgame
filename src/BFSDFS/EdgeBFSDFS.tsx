// BFSDFS/EdgeBFSDFS.tsx
/**
 * מציג צלע בגרף - קו בין שני קודקודים, עם חץ אם הגרף מכוון.
 * אין כאן משקל מוצג (showWeight אפשרי, אך כברירת מחדל לא נשתמש).
 */
import React from "react";
import { NodeType, EdgeType } from "./GraphCanvasTypes";
import "./GraphGame.css";

interface EdgeProps {
  edge: EdgeType;
  nodes: NodeType[];
  directed: boolean; // האם הגרף מכוון
  fontSizeEdgeLabel: number;
  offsetEdgeLabel: number;
  highlighted: boolean; // האם להדגיש צלע זו
  onClick?: (edgeId: number) => void;
}

const EdgeBFSDFS: React.FC<EdgeProps> = ({
  edge,
  nodes,
  directed,
  fontSizeEdgeLabel,
  offsetEdgeLabel,
  highlighted,
  onClick,
}) => {
  const fromNode = nodes.find((n) => n.id === edge.from);
  const toNode = nodes.find((n) => n.id === edge.to);
  if (!fromNode || !toNode) return null;

  const strokeColor = highlighted ? "red" : "black";
  const strokeWidth = highlighted ? 4 : 2;

  return (
    <g onClick={() => onClick && onClick(edge.id)}>
      <line
        x1={fromNode.x}
        y1={fromNode.y}
        x2={toNode.x}
        y2={toNode.y}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        markerEnd={directed ? "url(#arrow)" : undefined}
      />
      {/* אם היינו רוצים משקל - אפשר להוסיף כאן טקסט */}
    </g>
  );
};

export default EdgeBFSDFS;
