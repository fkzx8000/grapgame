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

  const dragStartNode = useRef(null);

  // // אתחול ראשוני
  useEffect(() => {
    dispatch({ type: "INIT_NODES", payload: generateInitialNodes(1) });
  }, []);

  // טיימר להרצת האלגוריתם
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        dispatch({ type: "NEXT_STEP" });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // // יצירת צמתים ראשוניים
  const generateInitialNodes = (count) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      x: Math.cos(((i * 360) / count) * (Math.PI / 180)) * 200 + 400,
      y: Math.sin(((i * 360) / count) * (Math.PI / 180)) * 200 + 300,
      neighbors: [],
      isStart: i === 0,
    }));
  };

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

  // ניהול אינטראקציות עם צמתים
  const handleNodeInteraction = (node, isRightClick = false) => {
    if (isRightClick) {
      dispatch({ type: "TOGGLE_EDGE_MODE" });
      dragStartNode.current = node;
      return;
    }

    if (isAddingEdge) {
      if (dragStartNode.current && dragStartNode.current.id !== node.id) {
        dispatch({
          type: "ADD_EDGE",
          payload: { from: dragStartNode.current.id, to: node.id },
        });
      }
      dispatch({ type: "TOGGLE_EDGE_MODE" });
    } else {
      dispatch({ type: "SET_START_NODE", payload: node.id });
    }
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
        <select
          value={currentAlgorithm || ""}
          onChange={(e) =>
            dispatch({ type: "SET_ALGORITHM", payload: e.target.value })
          }
        >
          <option value="">בחר אלגוריתם</option>
          <option value="BFS">BFS</option>
          <option value="DFS">DFS</option>
        </select>
        <button
          onClick={() => dispatch({ type: "START_ALGORITHM" })}
          disabled={!currentAlgorithm || isPlaying}
        >
          התחל
        </button>
        <button onClick={() => dispatch({ type: "RESET" })}>אפס</button>
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

      {/* טבלאות מצב */}
      <div className="algorithm-tables">
        <div className="table-container">
          <h3>{currentAlgorithm} Queue/Stack</h3>
          <table>
            <tbody>
              {(currentAlgorithm === "BFS" ? bfsQueue : dfsStack).map(
                (n, i) => (
                  <tr key={i}>
                    <td>{n.id}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="table-container">
          <h3>Visited Nodes</h3>
          <table>
            <tbody>
              {Array.from(visited).map((nodeId, i) => (
                <tr key={i}>
                  <td>{nodeId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {message && <div className="error-message">{message}</div>}
    </div>
  );
};

export default BFSDFSGame;
