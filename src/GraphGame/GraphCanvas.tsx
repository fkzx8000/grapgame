// GraphCanvas.tsx
import React from "react";
import Node from "./Node";
import Edge from "./Edge";
import { NodeType, EdgeType } from "./GraphCanvasTypes";
import "./GraphGame.css";

interface GraphCanvasProps {
  svgRef: React.RefObject<SVGSVGElement>;
  svgWidth: number;
  svgHeight: number;
  nodes: NodeType[];
  edges: EdgeType[];
  nodeRadius: number;
  fontSizeNodeLabel: number;
  fontSizeEdgeLabel: number;
  offsetEdgeLabel: number;
  highlightedEdges: number[];
  handleCanvasClick: (e: React.MouseEvent<SVGSVGElement>) => void;
  handleNodeClick: (nodeId: number) => void;
  handleNodeMouseDown: (nodeId: number, e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void;
  handleMouseUp: () => void;
  userPath: number[];
}

const GraphCanvas: React.FC<GraphCanvasProps> = ({
  svgRef,
  svgWidth,
  svgHeight,
  nodes,
  edges,
  nodeRadius,
  fontSizeNodeLabel,
  fontSizeEdgeLabel,
  offsetEdgeLabel,
  highlightedEdges,
  handleCanvasClick,
  handleNodeClick,
  handleNodeMouseDown,
  handleMouseMove,
  handleMouseUp,
  userPath,
}) => {
  return (
    <div className="graph-wrapper">
      <svg
        ref={svgRef}
        width={svgWidth}
        height={svgHeight}
        className="graph-canvas"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <defs>
          {/*
            נשתמש ב-refX קצת יותר גדול מהרדיוס (18)
            כדי שהחץ ייעצר בקצה העיגול במקום לחדור לתוכו.
          */}
          <marker
            id="arrow"
            markerWidth="10"
            markerHeight="10"
            refX="22" // ערך גדול מ-18
            refY="5"
            orient="auto"
          >
            <path d="M0,0 L0,10 L10,5 z" fill="black" />
          </marker>
        </defs>

        {edges.map((edge) => (
          <Edge
            key={edge.id}
            edge={edge}
            nodes={nodes}
            // edges={edges}  // ← אם תרצה לבדוק מול שאר הצלעות
            fontSizeEdgeLabel={fontSizeEdgeLabel}
            offsetEdgeLabel={offsetEdgeLabel}
            highlighted={highlightedEdges.includes(edge.id)}
          />
        ))}

        {nodes.map((node) => (
          <Node
            key={node.id}
            node={node}
            nodeRadius={nodeRadius}
            fontSizeNodeLabel={fontSizeNodeLabel}
            onClick={() => handleNodeClick(node.id)}
            onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
          />
        ))}

        {userPath.length > 0 && (
          <polyline
            points={userPath
              .map((nid) => {
                const n = nodes.find((node) => node.id === nid);
                return n ? `${n.x},${n.y}` : "";
              })
              .join(" ")}
            fill="none"
            stroke="blue"
            strokeWidth="3"
          />
        )}
      </svg>
    </div>
  );
};

export default GraphCanvas;
