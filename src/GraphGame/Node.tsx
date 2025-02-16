// GraphGame/Node.tsx
//
// קומפוננטה המציגה קודקוד (עיגול עם תווית).
// אם זה מקור - צבוע בתכלת, אם זה יעד - צבוע בורוד בהיר (lightcoral), אחרת לבן.
// יש כאן אירועים onClick ו-onMouseDown לצורך סימולציה/גרירה.

import React from "react";
import { NodeType } from "./GraphCanvasTypes";
import "./GraphGame.css";

interface NodeProps {
  node: NodeType;
  nodeRadius: number;
  fontSizeNodeLabel: number;
  onClick: () => void; // לחיצה על הקודקוד
  onMouseDown: (e: React.MouseEvent) => void; // התחלת גרירה (אופציונלי)
}

const Node: React.FC<NodeProps> = ({
  node,
  nodeRadius,
  fontSizeNodeLabel,
  onClick,
  onMouseDown,
}) => {
  // צביעת הקודקוד לפי התווית שלו
  let fillColor = "white";
  if (node.label === "s") {
    fillColor = "lightblue"; // מקור
  } else if (node.label === "t") {
    fillColor = "lightcoral"; // יעד
  }

  return (
    <g
      onClick={onClick}
      onMouseDown={onMouseDown}
      style={{ cursor: "pointer" }}
    >
      <circle
        cx={node.x}
        cy={node.y}
        r={nodeRadius}
        fill={fillColor}
        stroke="black"
        strokeWidth={1.5}
      />
      <text
        x={node.x}
        y={node.y}
        fontSize={fontSizeNodeLabel}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#000"
      >
        {node.label}
      </text>
    </g>
  );
};

export default Node;
