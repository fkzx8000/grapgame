// GraphGame/GraphCanvas.tsx
/**
 * קומפוננטת GraphCanvas:
 * - מציגה את הגרף ב-SVG.
 * - מרנדרת את כל הצלעות (EdgeUndirected) והקודקודים (Node).
 * - מקבלת גם את אירועי הלחיצה והגרירה.
 */
import React from "react";
import Node from "./Node";
import EdgeUndirected from "./EdgeUndirected";
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
  handleEdgeClick: (edgeId: number) => void;
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
  handleEdgeClick,
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
        {edges.map((edge) => (
          <EdgeUndirected
            key={edge.id}
            edge={edge}
            nodes={nodes}
            fontSizeEdgeLabel={fontSizeEdgeLabel}
            offsetEdgeLabel={offsetEdgeLabel}
            highlighted={highlightedEdges.includes(edge.id)}
            onClick={handleEdgeClick}
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
