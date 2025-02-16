// GraphGame/GraphGame.tsx
//
// קומפוננטה מרכזית: מנהלת מצב (סטייט) הגרף, מצבי עריכה וסימולציה,
// ומממשת את אלגוריתם הזרימה (כולל BFS בגרף השארי).
// אם additionalFlow=0 => "כל הכבוד, הזרימה מקסימלית!"

import React, { useState, useRef } from "react";
import Toolbar from "./Toolbar";
import StatusBar from "./StatusBar";
import GraphCanvas from "./GraphCanvas";
import SolutionSteps from "./SolutionSteps";
import { NodeType, EdgeType } from "./GraphCanvasTypes";
import "./GraphGame.css";

const GraphGame: React.FC = () => {
  // ==== מצב הגרף ====
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [edges, setEdges] = useState<EdgeType[]>([]);

  // ==== מצבי משחק: "edit" או "simulation" ====
  const [mode, setMode] = useState<"edit" | "simulation">("edit");
  // תת-מצבי עריכה: null, addNode, addEdge, setSource, setTarget
  const [editMode, setEditMode] = useState<
    "addNode" | "addEdge" | "setSource" | "setTarget" | null
  >(null);
  const [selectedEdgeSource, setSelectedEdgeSource] = useState<number | null>(
    null
  );

  // ==== הגדרת מקור ויעד (s,t) ====
  const [sourceNode, setSourceNode] = useState<number | null>(null);
  const [targetNode, setTargetNode] = useState<number | null>(null);

  // ==== מצב סימולציה ====
  const [userPath, setUserPath] = useState<number[]>([]);
  const [message, setMessage] = useState<string>("");

  // ==== מונים ====
  const [nodeCounter, setNodeCounter] = useState<number>(0);
  const [edgeCounter, setEdgeCounter] = useState<number>(0);

  // ==== פתרון אוטומטי ====
  const [autoSolving, setAutoSolving] = useState<boolean>(false);
  const [highlightedEdges, setHighlightedEdges] = useState<number[]>([]);
  const [solutionSteps, setSolutionSteps] = useState<
    { path: number[]; bottleneck: number }[]
  >([]);

  // ==== גרירת קודקודים ====
  const [draggingNode, setDraggingNode] = useState<number | null>(null);

  // ==== קבועים ל-SVG ====
  const svgWidth = 800;
  const svgHeight = 500;
  const nodeRadius = 18;
  const fontSizeEdgeLabel = 16;
  const fontSizeNodeLabel = 16;
  const offsetEdgeLabel = -10;

  // מדריך
  const [showGuide, setShowGuide] = useState<boolean>(false);

  const svgRef = useRef<SVGSVGElement>(null);

  // ---- פונקציות חישוב BFS בגרף השארי ----

  // מקבלת קיבולת שארית בין שני קודקודים u -> v
  const getResidualCapacity = (u: number, v: number): number => {
    // בדיקת צלע קדימה (capacity - flow)
    const fwd = edges.find((ed) => ed.from === u && ed.to === v);
    if (fwd) {
      const cap = fwd.capacity - fwd.flow;
      if (cap > 0) return cap;
    }
    // בדיקת צלע הפוכה (reverse = flow)
    const rev = edges.find((ed) => ed.from === v && ed.to === u);
    if (rev) {
      const revCap = rev.flow;
      if (revCap > 0) return revCap;
    }
    return 0;
  };

  // BFS לחיפוש מסלול מרחיב מהמקור ליעד
  const computeAugmentingPath = (): {
    path: number[];
    bottleneck: number;
  } | null => {
    if (sourceNode === null || targetNode === null) return null;
    const queue = [sourceNode];
    const visited: Record<number, number | null> = { [sourceNode]: null };

    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (curr === targetNode) break;
      // עוברים על כל הקודקודים ובודקים אם לא ביקרנו ואם יש קיבולת שארית > 0
      nodes.forEach((nd) => {
        if (!visited.hasOwnProperty(nd.id)) {
          const rc = getResidualCapacity(curr, nd.id);
          if (rc > 0) {
            visited[nd.id] = curr;
            queue.push(nd.id);
          }
        }
      });
    }
    if (!visited.hasOwnProperty(targetNode)) {
      return null;
    }
    // משחזרים את הנתיב ומוצאים צוואר בקבוק
    const path: number[] = [];
    let bottleneck = Infinity;
    let at: number | null = targetNode;
    while (at !== null) {
      path.unshift(at);
      const par = visited[at];
      if (par !== null) {
        const rc = getResidualCapacity(par, at);
        if (rc < bottleneck) bottleneck = rc;
      }
      at = par;
    }
    return { path, bottleneck };
  };

  // עדכון הזרימה בנתיב (לאורך path) בגודל augmentation
  const applyAugmentation = (path: number[], augmentation: number) => {
    const newEdges = edges.map((e) => ({ ...e }));
    for (let i = 0; i < path.length - 1; i++) {
      const u = path[i];
      const v = path[i + 1];
      const forwardIndex = newEdges.findIndex(
        (ed) => ed.from === u && ed.to === v
      );
      if (forwardIndex !== -1) {
        newEdges[forwardIndex].flow += augmentation;
      } else {
        // reverse
        const revIndex = newEdges.findIndex(
          (ed) => ed.from === v && ed.to === u
        );
        if (revIndex !== -1) {
          newEdges[revIndex].flow -= augmentation;
        }
      }
    }
    setEdges(newEdges);
  };

  // חישוב סך כל הזרימה היוצאת מהמקור
  const computeMaxFlow = (): number => {
    if (sourceNode === null) return 0;
    let total = 0;
    edges.forEach((ed) => {
      if (ed.from === sourceNode) total += ed.flow;
    });
    return total;
  };

  // חישוב פוטנציאל זרימה נוסף (אם additional=0 => אין מסלולים!)
  const computeMaxAdditionalFlow = (): number => {
    // יוצרים העתק מקומי של edges
    const localEdges = edges.map((e) => ({ ...e }));
    let total = 0;
    const localGetRC = (u: number, v: number) => {
      const fwd = localEdges.find((ed) => ed.from === u && ed.to === v);
      if (fwd) return fwd.capacity - fwd.flow;
      const rev = localEdges.find((ed) => ed.from === v && ed.to === u);
      if (rev) return rev.flow;
      return 0;
    };
    const localApplyAug = (p: number[], aug: number) => {
      for (let i = 0; i < p.length - 1; i++) {
        const uu = p[i];
        const vv = p[i + 1];
        const fi = localEdges.findIndex((ed) => ed.from === uu && ed.to === vv);
        if (fi !== -1) {
          localEdges[fi].flow += aug;
        } else {
          const ri = localEdges.findIndex(
            (ed) => ed.from === vv && ed.to === uu
          );
          if (ri !== -1) localEdges[ri].flow -= aug;
        }
      }
    };
    const localBFS = (): { path: number[]; bottleneck: number } | null => {
      if (sourceNode === null || targetNode === null) return null;
      const queue = [sourceNode];
      const visited: Record<number, number | null> = { [sourceNode]: null };
      while (queue.length > 0) {
        const c = queue.shift()!;
        if (c === targetNode) break;
        nodes.forEach((nd) => {
          if (!visited.hasOwnProperty(nd.id)) {
            const rc = localGetRC(c, nd.id);
            if (rc > 0) {
              visited[nd.id] = c;
              queue.push(nd.id);
            }
          }
        });
      }
      if (!visited.hasOwnProperty(targetNode)) return null;
      const p: number[] = [];
      let bneck = Infinity;
      let at = targetNode;
      while (at !== null) {
        p.unshift(at);
        const par = visited[at];
        if (par !== null) {
          const rc = localGetRC(par, at);
          if (rc < bneck) bneck = rc;
        }
        at = par;
      }
      return { path: p, bottleneck: bneck };
    };
    while (true) {
      if (sourceNode === null || targetNode === null) break;
      const res = localBFS();
      if (!res) break;
      total += res.bottleneck;
      localApplyAug(res.path, res.bottleneck);
    }
    return total;
  };

  // ----------------------------------------------
  // פונקציות למצב עריכה
  // ----------------------------------------------

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (mode !== "edit" || !editMode) return;
    if (editMode !== "addNode") return;
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newNode: NodeType = {
      id: nodeCounter,
      label: `n${nodeCounter}`,
      x,
      y,
    };
    setNodeCounter(nodeCounter + 1);
    setNodes([...nodes, newNode]);
    setMessage(
      `נוסף קודקוד id=${newNode.id} במיקום (${Math.round(x)}, ${Math.round(
        y
      )}).`
    );
    setEditMode(null);
  };

  const handleEditModeNodeClick = (nodeId: number) => {
    if (!editMode) return;
    if (editMode === "addEdge") {
      if (selectedEdgeSource === null) {
        setSelectedEdgeSource(nodeId);
        setMessage("בחר קודקוד יעד לצלע (לא יכול להיות זהה למקור).");
      } else {
        if (selectedEdgeSource === nodeId) {
          setMessage("לא ניתן ליצור צלע מאותו קודקוד לעצמו.");
        } else {
          const capStr = prompt("הכנס קיבולת לצלע:");
          if (capStr && parseInt(capStr) > 0) {
            const newEdge: EdgeType = {
              id: edgeCounter,
              from: selectedEdgeSource,
              to: nodeId,
              capacity: parseInt(capStr),
              flow: 0,
            };
            setEdges([...edges, newEdge]);
            setEdgeCounter(edgeCounter + 1);
            setMessage("צלע נוספה בהצלחה.");
          }
        }
        setSelectedEdgeSource(null);
        setEditMode(null);
      }
    } else if (editMode === "setSource") {
      if (sourceNode !== null && sourceNode !== nodeId) {
        setMessage("כבר הגדרת מקור! ניתן להגדיר רק מקור אחד.");
      } else {
        setNodes(
          nodes.map((n) => (n.id === nodeId ? { ...n, label: "s" } : n))
        );
        setSourceNode(nodeId);
        setMessage("הוגדר מקור (s).");
      }
      setEditMode(null);
    } else if (editMode === "setTarget") {
      if (targetNode !== null && targetNode !== nodeId) {
        setMessage("כבר הגדרת יעד! ניתן להגדיר רק יעד אחד.");
      } else {
        setNodes(
          nodes.map((n) => (n.id === nodeId ? { ...n, label: "t" } : n))
        );
        setTargetNode(nodeId);
        setMessage("הוגדר יעד (t).");
      }
      setEditMode(null);
    }
  };

  const handleNodeClick = (nodeId: number) => {
    if (mode === "edit") {
      handleEditModeNodeClick(nodeId);
    } else if (mode === "simulation") {
      // במצב סימולציה - המשתמש בוחר נתיב להרחבה
      if (userPath.length === 0) {
        // חייב להתחיל ב-s
        if (nodeId !== sourceNode) {
          setMessage("יש להתחיל את הנתיב במקור (s).");
          return;
        }
        setUserPath([nodeId]);
        setMessage("");
      } else {
        // בודקים קיבולת שארית בין הקודקוד האחרון ל-nId
        const lastNode = userPath[userPath.length - 1];
        const rc = getResidualCapacity(lastNode, nodeId);
        if (rc <= 0) {
          setMessage("אין קיבולת שארית מהקודקוד האחרון לזה שבחרת.");
          return;
        }
        if (userPath.includes(nodeId)) {
          setMessage("הקודקוד כבר בנתיב. בחר קודקוד אחר.");
          return;
        }
        setUserPath([...userPath, nodeId]);
        setMessage("");
      }
    }
  };

  const handleNodeMouseDown = (nodeId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingNode(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingNode !== null && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setNodes(nodes.map((n) => (n.id === draggingNode ? { ...n, x, y } : n)));
    }
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
  };

  // -----------
  // כפתורים ופעולות
  // -----------
  const startSimulation = () => {
    if (sourceNode === null || targetNode === null) {
      setMessage("קודם הגדר מקור ויעד לפני סימולציה.");
      return;
    }
    setMode("simulation");
    setUserPath([]);
    setMessage("מצב סימולציה - בחר נתיב מרחיב או השתמש בפתרון אוטומטי.");
  };

  const startEditMode = () => {
    setMode("edit");
    setEditMode(null);
    setUserPath([]);
    setMessage("חזרת למצב עריכה.");
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
    setAutoSolving(false);
    setHighlightedEdges([]);
    setSolutionSteps([]);
  };

  const cancelEdit = () => {
    setEditMode(null);
    setSelectedEdgeSource(null);
    setMessage("עריכה בוטלה.");
  };

  const addSourceAndTarget = () => {
    if (
      nodes.some((n) => n.label === "s") ||
      nodes.some((n) => n.label === "t")
    ) {
      setMessage("s או t כבר קיימים.");
      return;
    }
    const sId = nodeCounter;
    const tId = nodeCounter + 1;
    setNodeCounter(nodeCounter + 2);
    const sNode: NodeType = { id: sId, label: "s", x: 50, y: svgHeight / 2 };
    const tNode: NodeType = {
      id: tId,
      label: "t",
      x: svgWidth - 50,
      y: svgHeight / 2,
    };
    setNodes([...nodes, sNode, tNode]);
    setSourceNode(sId);
    setTargetNode(tId);
    setMessage("נוספו מקור (s) ויעד (t).");
  };

  // סימון אם additionalFlow=0 => "כל הכבוד, הזרימה מקסימלית"
  const currentFlow = computeMaxFlow();
  const additionalFlow = computeMaxAdditionalFlow();
  if (additionalFlow === 0 && mode === "simulation") {
    // אם אין עוד מסלולים אפשריים, הודעת ברכה
    if (message.indexOf("מקסימלית") === -1) {
      setMessage("כל הכבוד, הזרימה מקסימלית! אין עוד מסלולים להרחבה.");
    }
  }

  // ---- פעולות במצב סימולציה: הגשת נתיב ידני
  const handleSubmitPath = () => {
    if (mode !== "simulation") return;
    if (userPath.length < 2) {
      setMessage("הנתיב חייב להכיל לפחות שני קודקודים.");
      return;
    }
    if (userPath[userPath.length - 1] !== targetNode) {
      setMessage("הנתיב חייב להסתיים ביעד (t).");
      return;
    }
    // בודקים אם יש בכלל מסלול מרחיב BFS
    const bfsRes = computeAugmentingPath();
    if (!bfsRes) {
      setMessage(
        `אין עוד מסלולים. הזרימה היא מקסימלית! ערך זרימה: ${currentFlow}.`
      );
      return;
    }
    // משווים את path מהמשתמש למסלול ה-BFS
    const userPathStr = JSON.stringify(userPath);
    const correctStr = JSON.stringify(bfsRes.path);
    if (userPathStr !== correctStr) {
      setMessage(
        `הנתיב אינו תואם לנתיב BFS. הנתיב הנכון הוא: ${bfsRes.path.join("->")}`
      );
      return;
    }
    // אם הנתיב תואם
    applyAugmentation(userPath, bfsRes.bottleneck);
    setMessage(`נתיב התקבל! הוספנו זרימה: ${bfsRes.bottleneck}.`);
    setUserPath([]);
    // בדיקה נוספת אם כבר אין עוד מסלולים
    const next = computeAugmentingPath();
    if (!next) {
      setMessage(
        `אין עוד מסלולים. כל הכבוד! זרימה מקסימלית: ${computeMaxFlow()}.`
      );
    }
  };

  const handleResetPath = () => {
    setUserPath([]);
    setMessage("הנתיב הידני אופס.");
  };

  // ---- פתרון אוטומטי (הפעלה רציפה)
  const autoSolve = () => {
    if (sourceNode === null || targetNode === null) {
      setMessage("קודם הגדר מקור ויעד לפני הפתרון האוטומטי.");
      return;
    }
    setAutoSolving(true);
    setSolutionSteps([]);
    const runStep = () => {
      const res = computeAugmentingPath();
      if (!res) {
        setMessage(`אין עוד מסלולים. הזרימה מקסימלית: ${computeMaxFlow()}.`);
        setAutoSolving(false);
        setHighlightedEdges([]);
        return;
      }
      applyAugmentation(res.path, res.bottleneck);
      setSolutionSteps((prev) => [...prev, res]);
      // סימון הצלעות בנתיב
      const eIds: number[] = [];
      for (let i = 0; i < res.path.length - 1; i++) {
        const u = res.path[i];
        const v = res.path[i + 1];
        const fwd = edges.find((ed) => ed.from === u && ed.to === v);
        if (fwd) eIds.push(fwd.id);
        else {
          const rev = edges.find((ed) => ed.from === v && ed.to === u);
          if (rev) eIds.push(rev.id);
        }
      }
      setHighlightedEdges(eIds);
      setMessage(
        `מסלול מרחיב: ${res.path.join("->")} (צוואר בקבוק: ${res.bottleneck}).`
      );
      setTimeout(() => {
        setHighlightedEdges([]);
        if (autoSolving) runStep();
      }, 1000);
    };
    runStep();
  };

  // מעטפת המדריך
  const gameGuide = (
    <div className="guide-container">
      <h3>מדריך שימוש (How to Play)</h3>
      <ul>
        <li>
          במצב עריכה (edit): הוסף קודקודים, הוסף צלעות (קיבולת), הגדר מקור (s)
          ויעד (t).
        </li>
        <li>
          לאחר מכן עבור למצב סימולציה, ובחר ידנית נתיבי הרחבה או לחץ על פתרון
          אוטומטי.
        </li>
        <li>אם פוטנציאל הזרימה הנוספת מגיע 0 = הזרימה מקסימלית!</li>
      </ul>
      <p>בהצלחה בסימולציה של מקס-פלו!</p>
    </div>
  );

  return (
    <div className="graph-game-container">
      {showGuide && gameGuide}

      <StatusBar
        currentFlow={currentFlow}
        additionalFlow={additionalFlow}
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
        toggleGuide={() => setShowGuide(!showGuide)}
        handleSubmitPath={handleSubmitPath}
        handleResetPath={handleResetPath}
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
      {/* אם יש שלבים (בפתרון אוטומטי) - מציגים אותם */}
      {mode === "simulation" && solutionSteps.length > 0 && (
        <SolutionSteps
          steps={solutionSteps}
          getNodeLabel={(id) => {
            const nd = nodes.find((n) => n.id === id);
            return nd ? nd.label : `(${id})`;
          }}
        />
      )}
    </div>
  );
};

export default GraphGame;
