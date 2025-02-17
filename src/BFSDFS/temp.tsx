import React, {
  useReducer,
  useEffect,
  useCallback,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import "./BFSDFSGame.css";
import { gameReducer, initialState } from "./gameReducer";

const BFSDFSGame = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [edgeStartNode, setEdgeStartNode] = useState(null);
  const svgRef = useRef(null);
  const {
    nodes,
    edges,
    visited,
    path,
    bfsQueue,
    dfsStack,
    currentAlgorithm,
    isPlaying,
    message,
    currentNode,
    isAddingEdge,
  } = state;

  // הוספת קודקוד עם מניעת חפיפה
  const addNode = () => {
    const padding = 60; // מרחק מינימלי בין קודקודים
    let x, y, collision;

    do {
      collision = false;
      x = Math.random() * 600 + 100;
      y = Math.random() * 400 + 100;

      // בדיקת חפיפה עם קודקודים קיימים
      for (const node of nodes) {
        const dx = node.x - x;
        const dy = node.y - y;
        if (Math.sqrt(dx * dx + dy * dy) < padding) {
          collision = true;
          break;
        }
      }
    } while (collision);

    dispatch({
      type: "ADD_NODE",
      payload: {
        id: nodes.length + 1,
        x,
        y,
        neighbors: [],
        isStart: false,
      },
    });
  };

  // ניהול הוספת צלעות
  const handleEdgeCreation = (node, isRightClick) => {
    if (isRightClick) {
      setEdgeStartNode(node);
      dispatch({ type: "TOGGLE_EDGE_MODE" });
      return;
    }

    if (edgeStartNode && node.id !== edgeStartNode.id) {
      dispatch({
        type: "ADD_EDGE",
        payload: {
          from: edgeStartNode.id,
          to: node.id,
        },
      });
    }
    setEdgeStartNode(null);
  };

  return (
    <div className="game-container">
      <div className="toolbar">
        <button onClick={addNode}>➕ הוסף קודקוד</button>
        <button
          onContextMenu={(e) => {
            e.preventDefault();
            dispatch({ type: "TOGGLE_EDGE_MODE" });
          }}
        >
          {isAddingEdge ? "ביטול הוספת צלע" : "➕ הוסף צלע (קליק ימני)"}
        </button>
      </div>

      <svg
        ref={svgRef}
        width="800"
        height="600"
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* ציור צלעות */}
        {edges.map((edge) => {
          const fromNode = nodes.find((n) => n.id === edge.from);
          const toNode = nodes.find((n) => n.id === edge.to);
          return (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              className={`edge ${isAddingEdge ? "edge-creation" : ""}`}
            />
          );
        })}

        {/* ציור קודקודים */}
        {nodes.map((node) => (
          <g key={node.id} transform={`translate(${node.x},${node.y})`}>
            <motion.circle
              r={25}
              className={`
                node 
                ${node.isStart ? "start" : ""}
                ${visited.has(node.id) ? "visited" : ""}
                ${edgeStartNode?.id === node.id ? "edge-source" : ""}
              `}
              onContextMenu={() => handleEdgeCreation(node, true)}
              onClick={() => handleEdgeCreation(node, false)}
              animate={{ scale: currentNode === node.id ? 1.2 : 1 }}
            />
            <text className="node-label">{node.id}</text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default BFSDFSGame;
