// Node.tsx
import React from "react";
import { NodeType } from "./GraphCanvasTypes";
import "./GraphGame.css";

interface NodeProps {
  node: NodeType;
  nodeRadius: number;
  fontSizeNodeLabel: number;
  onClick: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
}

const Node: React.FC<NodeProps> = ({
  node,
  nodeRadius,
  fontSizeNodeLabel,
  onClick,
  onMouseDown,
}) => {
  // צביעת קודקוד:
  // מקור (s) = "lightblue"
  // יעד (t) = "lightcoral"
  // אחר = "white"
  let fillColor = "white";
  if (node.label === "s") {
    fillColor = "lightblue";
  } else if (node.label === "t") {
    fillColor = "lightcoral"; // אדום בהיר
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
