// GraphGame.tsx
import React, { useState, useRef } from "react";
import Toolbar from "./Toolbar";
import StatusBar from "./StatusBar";
import { NodeType, EdgeType } from "./GraphCanvasTypes";

import GraphCanvas from "./GraphCanvas";
import SolutionSteps from "./SolutionSteps";
import "./GraphGame.css";

const GraphGame: React.FC = () => {
  // ----- מצב הגרף -----
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [edges, setEdges] = useState<EdgeType[]>([]);

  // ----- מצבי משחק -----
  const [mode, setMode] = useState<"edit" | "simulation">("edit");
  const [editMode, setEditMode] = useState<
    "addNode" | "addEdge" | "setSource" | "setTarget" | null
  >(null);
  const [selectedEdgeSource, setSelectedEdgeSource] = useState<number | null>(
    null
  );

  // ----- הגדרות מקור ויעד -----
  const [sourceNode, setSourceNode] = useState<number | null>(null);
  const [targetNode, setTargetNode] = useState<number | null>(null);

  // ----- מצב סימולציה -----
  const [userPath, setUserPath] = useState<number[]>([]);
  const [message, setMessage] = useState<string>("");

  // ----- מונים -----
  const [nodeCounter, setNodeCounter] = useState<number>(0);
  const [edgeCounter, setEdgeCounter] = useState<number>(0);
  const [manualLabelCounter, setManualLabelCounter] = useState<number>(0);

  // ----- מצב פתרון אוטומטי -----
  const [autoSolving, setAutoSolving] = useState<boolean>(false);
  const [highlightedEdges, setHighlightedEdges] = useState<number[]>([]);
  const [solutionSteps, setSolutionSteps] = useState<
    { path: number[]; bottleneck: number }[]
  >([]);

  // ----- מצב גרירה -----
  const [draggingNode, setDraggingNode] = useState<number | null>(null);

  // ----- קבועי SVG -----
  const svgWidth = 800;
  const svgHeight = 500;
  const nodeRadius = 18;
  // const edgeWidthHighlighted = 5;
  // const edgeWidthNormal = 2;
  const fontSizeEdgeLabel = 16;
  const fontSizeNodeLabel = 16;
  const offsetEdgeLabel = -10;

  const svgRef = useRef<SVGSVGElement>(null!);

  // ----- פונקציות עזר -----
  const getManualLabel = (n: number): string => {
    const alphabet = "abcdefghijklmnopqruvwxyz";
    return n < alphabet.length
      ? alphabet[n]
      : alphabet[n % alphabet.length] + Math.floor(n / alphabet.length);
  };

  const getNodeLabel = (nodeId: number): string => {
    const node = nodes.find((n) => n.id === nodeId);
    return node ? node.label : "";
  };

  const getResidualCapacity = (u: number, v: number): number => {
    const edge = edges.find((e) => e.from === u && e.to === v);
    if (edge) {
      const cap = edge.capacity - edge.flow;
      if (cap > 0) return cap;
    }
    const rev = edges.find((e) => e.from === v && e.to === u);
    if (rev) {
      const cap = rev.flow;
      if (cap > 0) return cap;
    }
    return 0;
  };

  const computeAugmentingPath = (): {
    path: number[];
    bottleneck: number;
  } | null => {
    if (sourceNode === null || targetNode === null) return null;
    const queue: number[] = [sourceNode];
    const visited: { [key: number]: number | null } = { [sourceNode]: null };

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === targetNode) break;
      nodes.forEach((node) => {
        if (
          !visited.hasOwnProperty(node.id) &&
          getResidualCapacity(current, node.id) > 0
        ) {
          visited[node.id] = current;
          queue.push(node.id);
        }
      });
    }
    if (!visited.hasOwnProperty(targetNode)) return null;

    const path: number[] = [];
    let bottleneck = Infinity;
    let at: number | null = targetNode;
    while (at !== null) {
      path.unshift(at);
      const par: number | null = visited[at];
      if (par !== null) {
        const cap = getResidualCapacity(par, at);
        if (cap < bottleneck) bottleneck = cap;
      }
      at = par;
    }
    return { path, bottleneck };
  };

  const applyAugmentation = (path: number[], augmentation: number) => {
    const newEdges = edges.map((e) => ({ ...e }));
    for (let i = 0; i < path.length - 1; i++) {
      const u = path[i];
      const v = path[i + 1];
      const idx = newEdges.findIndex((e) => e.from === u && e.to === v);
      if (idx !== -1) {
        newEdges[idx].flow += augmentation;
      } else {
        const rIdx = newEdges.findIndex((e) => e.from === v && e.to === u);
        if (rIdx !== -1) {
          newEdges[rIdx].flow -= augmentation;
        }
      }
    }
    setEdges(newEdges);
  };

  const computeMaxFlow = (): number => {
    if (sourceNode === null) return 0;
    let sum = 0;
    edges.forEach((e) => {
      if (e.from === sourceNode) sum += e.flow;
    });
    return sum;
  };

  // שיטה פשוטה לחישוב זרימה נוספת (ניתן לשפר כך שלא יחליף את הגרף)
  const computeMaxAdditionalFlow = (): number => {
    if (sourceNode === null || targetNode === null) return 0;
    let addFlow = 0;
    let result = computeAugmentingPath();
    while (result) {
      addFlow += result.bottleneck;
      applyAugmentation(result.path, result.bottleneck);
      result = computeAugmentingPath();
    }
    return addFlow;
  };

  // ----- Event Handlers -----
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (mode !== "edit" || editMode !== "addNode") return;
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newNode = {
      id: nodeCounter,
      label: getManualLabel(manualLabelCounter),
      x,
      y,
    };
    setNodes([...nodes, newNode]);
    setNodeCounter(nodeCounter + 1);
    setManualLabelCounter(manualLabelCounter + 1);
    setMessage(
      `נוסף קודקוד "${newNode.label}" ב(${Math.round(x)},${Math.round(y)}).`
    );
    setEditMode(null);
  };

  const handleAddEdgeClick = (targetNodeId: number) => {
    if (selectedEdgeSource === null) {
      setSelectedEdgeSource(targetNodeId);
      setMessage("בחר קודקוד יעד לצלע (לא יכול להיות זהה למקור).");
      return;
    }
    if (selectedEdgeSource === targetNodeId) {
      setMessage("לא ניתן ליצור צלע מאותו קודקוד לעצמו.");
      setSelectedEdgeSource(null);
      setEditMode(null);
      return;
    }
    if (
      edges.find((e) => e.from === selectedEdgeSource && e.to === targetNodeId)
    ) {
      setMessage("כבר קיימת צלע בכיוון זה בין הקודקודים.");
      setSelectedEdgeSource(null);
      setEditMode(null);
      return;
    }
    const capStr = prompt(
      `קיבולת לצלע מ${getNodeLabel(selectedEdgeSource)} ל${getNodeLabel(
        targetNodeId
      )}:`
    );
    if (capStr !== null && !isNaN(Number(capStr)) && Number(capStr) > 0) {
      const newEdge = {
        id: edgeCounter,
        from: selectedEdgeSource,
        to: targetNodeId,
        capacity: Number(capStr),
        flow: 0,
      };
      setEdges([...edges, newEdge]);
      setEdgeCounter(edgeCounter + 1);
      setSelectedEdgeSource(null);
      setMessage("צלע נוספה בהצלחה.");
      setEditMode(null);
    } else {
      setMessage("קיבולת לא תקינה. נסה שוב.");
    }
  };

  // כאן אנו מוודאים שלא ניתן להגדיר יותר מקודקוד מקור או יעד
  const handleEditModeNodeClick = (nodeId: number) => {
    if (editMode === "addEdge") {
      handleAddEdgeClick(nodeId);
    } else if (editMode === "setSource") {
      if (sourceNode !== null && sourceNode !== nodeId) {
        setMessage("מקור כבר מוגדר. לא ניתן להגדיר יותר ממקור אחד.");
        return;
      }
      setNodes(nodes.map((n) => (n.id === nodeId ? { ...n, label: "s" } : n)));
      setSourceNode(nodeId);
      setEditMode(null);
      setMessage("הוגדר מקור: s");
    } else if (editMode === "setTarget") {
      if (targetNode !== null && targetNode !== nodeId) {
        setMessage("יעד כבר מוגדר. לא ניתן להגדיר יותר מיעד אחד.");
        return;
      }
      setNodes(nodes.map((n) => (n.id === nodeId ? { ...n, label: "t" } : n)));
      setTargetNode(nodeId);
      setEditMode(null);
      setMessage("הוגדר יעד: t");
    }
  };

  const handleSimulationModeNodeClick = (nodeId: number) => {
    if (userPath.length === 0) {
      if (nodeId !== sourceNode) {
        setMessage("יש להתחיל את הנתיב בקודקוד המקור (s).");
        return;
      }
      setUserPath([nodeId]);
    } else {
      const lastNode = userPath[userPath.length - 1];
      const rc = getResidualCapacity(lastNode, nodeId);
      if (rc <= 0) {
        setMessage(
          `אין קשת שארית מ${getNodeLabel(lastNode)} ל${getNodeLabel(nodeId)}.`
        );
        return;
      }
      if (userPath.includes(nodeId)) {
        setMessage("קודקוד כבר נמצא בנתיב. בחר אחר.");
        return;
      }
      setUserPath([...userPath, nodeId]);
    }
  };

  const handleNodeClick = (nodeId: number) => {
    if (mode === "edit") {
      handleEditModeNodeClick(nodeId);
    } else if (mode === "simulation") {
      handleSimulationModeNodeClick(nodeId);
    }
  };

  const handleNodeMouseDown = (nodeId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingNode(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    if (draggingNode !== null) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setNodes(nodes.map((n) => (n.id === draggingNode ? { ...n, x, y } : n)));
    }
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
  };

  // const handleSubmitPath = () => {
  //   if (mode !== "simulation") return;
  //   if (userPath.length < 2) {
  //     setMessage("בחר לפחות שני קודקודים: s ו-t.");
  //     return;
  //   }
  //   if (userPath[userPath.length - 1] !== targetNode) {
  //     setMessage("הנתיב חייב להסתיים ב-t.");
  //     return;
  //   }
  //   const result = computeAugmentingPath();
  //   if (!result) {
  //     setMessage(`הזרימה היא מקסימלית! סה"כ זרימה: ${computeMaxFlow()}`);
  //     return;
  //   }
  //   const { path: correctPath, bottleneck } = result;
  //   if (JSON.stringify(userPath) !== JSON.stringify(correctPath)) {
  //     setMessage(
  //       `נתיב שגוי! הנתיב המרחיב הוא: ${correctPath
  //         .map(getNodeLabel)
  //         .join(" -> ")}`
  //     );
  //     return;
  //   }
  //   applyAugmentation(userPath, bottleneck);
  //   setMessage(`נתיב נכון! צוואר: ${bottleneck}.`);
  //   setUserPath([]);
  //   if (!computeAugmentingPath()) {
  //     setMessage(`הזרימה היא מקסימלית! סה"כ זרימה: ${computeMaxFlow()}`);
  //   }
  // };

  // const handleResetPath = () => {
  //   setUserPath([]);
  //   setMessage("");
  // };

  const startEditMode = () => {
    setMode("edit");
    setEditMode(null);
    setUserPath([]);
    setMessage("עברנו למצב עריכה.");
  };

  const startSimulation = () => {
    if (sourceNode === null || targetNode === null) {
      setMessage("יש להגדיר s ו-t לפני סימולציה.");
      return;
    }
    if (edges.length === 0) {
      setMessage("יש ליצור לפחות צלע אחת לפני סימולציה.");
      return;
    }
    setMode("simulation");
    setUserPath([]);
    setMessage("מצב סימולציה פעיל. בחר נתיב מרחיב מ-s ל-t.");
  };

  const resetGame = () => {
    setNodes([]);
    setEdges([]);
    setSourceNode(null);
    setTargetNode(null);
    setMode("edit");
    setEditMode(null);
    setUserPath([]);
    setMessage("");
    setNodeCounter(0);
    setEdgeCounter(0);
    setManualLabelCounter(0);
    setAutoSolving(false);
    setHighlightedEdges([]);
    setSolutionSteps([]);
  };

  const cancelEdit = () => {
    setEditMode(null);
    setSelectedEdgeSource(null);
    setMessage("ביטול עריכה.");
  };

  const addSourceAndTarget = () => {
    // בדיקה אם כבר יש s או t
    if (
      nodes.some((n) => n.label === "s") ||
      nodes.some((n) => n.label === "t")
    ) {
      setMessage("s ו-t כבר קיימים.");
      return;
    }

    // מחשבים מראש את ה-id של המקור והיעד
    const sourceId = nodeCounter;
    const targetId = nodeCounter + 1;

    // מעדכנים את ה-counter בבת אחת, במקום לקרוא פעמיים
    setNodeCounter(nodeCounter + 2);

    // יוצרים את אובייקטי הקודקודים
    const source: NodeType = {
      id: sourceId,
      label: "s",
      x: 50,
      y: svgHeight / 2,
    };
    const target: NodeType = {
      id: targetId,
      label: "t",
      x: svgWidth - 50,
      y: svgHeight / 2,
    };

    // מוסיפים למערך הקודקודים
    setNodes([...nodes, source, target]);

    // מגדירים את state של מקור ויעד
    setSourceNode(sourceId);
    setTargetNode(targetId);

    setMessage("s ו-t נוספו אוטומטית.");
  };

  const autoSolve = () => {
    if (sourceNode === null || targetNode === null) {
      setMessage("יש להגדיר s ו-t לפני פתרון אוטומטי.");
      return;
    }
    if (autoSolving) {
      setMessage("פתרון אוטומטי כבר פועל.");
      return;
    }
    setSolutionSteps([]);
    setAutoSolving(true);
    const solveStep = () => {
      if (!autoSolving) return;
      const r = computeAugmentingPath();
      if (!r) {
        setMessage(`סיימנו! הזרימה מקסימלית: ${computeMaxFlow()}`);
        setAutoSolving(false);
        setHighlightedEdges([]);
        return;
      }
      const { path, bottleneck } = r;
      applyAugmentation(path, bottleneck);
      setSolutionSteps((prev) => [...prev, { path, bottleneck }]);
      highlightPathEdges(path);
      setMessage(
        `נתיב מרחיב: ${path
          .map(getNodeLabel)
          .join(" -> ")} (צוואר: ${bottleneck})`
      );
      setTimeout(() => {
        setHighlightedEdges([]);
        solveStep();
      }, 1000);
    };
    solveStep();
  };

  const highlightPathEdges = (path: number[]) => {
    const eIds: number[] = [];
    for (let i = 0; i < path.length - 1; i++) {
      const u = path[i];
      const v = path[i + 1];
      const found = edges.find(
        (ed) => (ed.from === u && ed.to === v) || (ed.from === v && ed.to === u)
      );
      if (found) eIds.push(found.id);
    }
    setHighlightedEdges(eIds);
  };

  return (
    <div className="graph-game-container">
      <StatusBar
        currentFlow={computeMaxFlow()}
        additionalFlow={computeMaxAdditionalFlow()}
        message={message}
      />
      <Toolbar
        mode={mode}
        editMode={editMode}
        setEditMode={setEditMode}
        startSimulation={startSimulation}
        resetGame={resetGame}
        cancelEdit={cancelEdit}
        addSourceAndTarget={addSourceAndTarget}
        autoSolve={autoSolve}
        startEditMode={startEditMode}
      />
      <GraphCanvas
        svgRef={svgRef}
        svgWidth={svgWidth}
        svgHeight={svgHeight}
        nodes={nodes}
        edges={edges}
        nodeRadius={nodeRadius}
        fontSizeNodeLabel={fontSizeNodeLabel}
        fontSizeEdgeLabel={fontSizeEdgeLabel}
        offsetEdgeLabel={offsetEdgeLabel}
        highlightedEdges={highlightedEdges}
        handleCanvasClick={handleCanvasClick}
        handleNodeClick={handleNodeClick}
        handleNodeMouseDown={handleNodeMouseDown}
        handleMouseMove={handleMouseMove}
        handleMouseUp={handleMouseUp}
        userPath={userPath}
      />
      {mode === "simulation" && solutionSteps.length > 0 && (
        <SolutionSteps steps={solutionSteps} getNodeLabel={getNodeLabel} />
      )}
    </div>
  );
};

export default GraphGame;
