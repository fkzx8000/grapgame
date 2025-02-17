// BFSDFS/Node.tsx
import React from "react";
import { NodeType } from "./GraphCanvasTypes";
import "./GraphGame.css";

interface NodeProps {
  node: NodeType;
  nodeRadius: number;
  fontSizeNodeLabel: number;
  onClick: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  color?: string; // "white"|"gray"|"black"|"green"|...
}

const Node: React.FC<NodeProps> = ({
  node,
  nodeRadius,
  fontSizeNodeLabel,
  onClick,
  onMouseDown,
  color,
}) => {
  let fillColor = "white";
  if (color === "gray") fillColor = "lightgray";
  else if (color === "black") fillColor = "#333";
  else if (color === "green") fillColor = "lightgreen";

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
