// BFSDFS/GraphCanvas.tsx
/**
 * מציג את הגרף (צלעות, קודקודים) + פוליליין של userPath, תוך גרירת קודקודים.
 * מתקן את השגיאה כשuserPath מכיל ערכים לא תקינים.
 */
import React from "react";
import Node from "./Node";
import EdgeBFSDFS from "./EdgeBFSDFS";
import { NodeType, EdgeType } from "./GraphCanvasTypes";
import "./GraphGame.css";

interface GraphCanvasProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  svgWidth: number;
  svgHeight: number;
  nodes: NodeType[];
  edges: EdgeType[];
  directed: boolean;
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
  // handleEdgeClick: (edgeId: number) => void;
  nodeColors: { [key: number]: string }; // לבן/אפור/שחור
}

const GraphCanvas: React.FC<GraphCanvasProps> = ({
  svgRef,
  svgWidth,
  svgHeight,
  nodes,
  edges,
  directed,
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
  // handleEdgeClick,
  nodeColors,
}) => {
  // const getFillColor = (col: string) => {
  //   switch (col) {
  //     case "gray":
  //       return "lightgray";
  //     case "black":
  //       return "#333";
  //     case "green":
  //       return "lightgreen";
  //     default:
  //       return "white";
  //   }
  // };

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
          {directed && (
            <marker
              id="arrow"
              markerWidth="10"
              markerHeight="10"
              refX="22"
              refY="5"
              orient="auto"
            >
              <path d="M0,0 L0,10 L10,5 z" fill="black" />
            </marker>
          )}
        </defs>

        {/* קודם מציגים צלעות */}
        {edges.map((edge) => (
          <EdgeBFSDFS
            key={edge.id}
            edge={edge}
            nodes={nodes}
            directed={directed}
            fontSizeEdgeLabel={fontSizeEdgeLabel}
            offsetEdgeLabel={offsetEdgeLabel}
            highlighted={highlightedEdges.includes(edge.id)}
            // onClick={handleEdgeClick}
          />
        ))}

        {/* אחר כך מציגים קודקודים */}
        {nodes.map((node) => {
          const color = nodeColors[node.id] || "white";
          return (
            <Node
              key={node.id}
              node={node}
              nodeRadius={nodeRadius}
              fontSizeNodeLabel={fontSizeNodeLabel}
              onClick={() => handleNodeClick(node.id)}
              onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
              color={color}
            />
          );
        })}

        {/* userPath מצויר כ- polyline */}
        {Array.isArray(userPath) && userPath.length > 0 && (
          <polyline
            points={userPath
              .filter((nid) => typeof nid === "number")
              .map((nid) => {
                const nd = nodes.find((n) => n.id === nid);
                return nd ? `${nd.x},${nd.y}` : "";
              })
              .filter((str) => str !== "")
              .join(" ")}
            fill="none"
            stroke="blue"
            strokeWidth={3}
          />
        )}
      </svg>
    </div>
  );
};

export default GraphCanvas;
