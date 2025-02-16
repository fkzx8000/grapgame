// Edge.tsx
import React from "react";
import { NodeType, EdgeType } from "./GraphCanvasTypes";
import "./GraphGame.css";

interface EdgeProps {
  edge: EdgeType;
  nodes: NodeType[];
  fontSizeEdgeLabel: number;
  offsetEdgeLabel: number;
  highlighted: boolean;
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

  // עובי הקו אם הצלע מודגשת
  const strokeWidth = highlighted ? 5 : 2;

  // נבדוק האם from < to או להיפך, כדי להחליט על כיוון העיקום
  // מטרתנו: אם from < to ⇒ קשת "למעלה", אחרת ⇒ קשת "למטה".
  // כך אם יש שתי צלעות מנוגדות (A→B ו-B→A), אחת תעוגל למעלה והשנייה למטה.
  if (edge.from !== edge.to) {
    // חשב וקטור בין הקודקודים
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const offset = 20; // מידת העיקום

    // וקטור מאונך (נורמלי)
    const nx = -dy / length;
    const ny = dx / length;

    // אם from < to ⇒ sign = +1 (קשת "למעלה"),
    // אחרת ⇒ sign = -1 (קשת "למטה").
    const sign = edge.from < edge.to ? +1 : -1;

    // נקודת בקרה לקשת (Quadratic Bézier)
    const cx = (fromNode.x + toNode.x) / 2 + sign * nx * offset;
    const cy = (fromNode.y + toNode.y) / 2 + sign * ny * offset;

    // מחרוזת הנתיב: Move→Quad→(Goal)
    const pathD = `M ${fromNode.x},${fromNode.y} Q ${cx},${cy} ${toNode.x},${toNode.y}`;

    return (
      <g key={edge.id}>
        {/* קו מעוגל עם חץ בסופו */}
        <path
          d={pathD}
          fill="none"
          stroke="black"
          strokeWidth={strokeWidth}
          markerEnd="url(#arrow)"
          id={`edge-${edge.id}`}
        />
        {/* מציג flow/capacity על הנתיב */}
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
    // אם הצלע היא לולאה (from === to), נוכל להציג באופן אחר, או כרגע קו ישר
    // (תוכל לשנות זאת בהתאם לצורך).
    // או אפשר להחזיר null אם אינך רוצה צלע ללולאה עצמית.
    return (
      <g key={edge.id}>
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
