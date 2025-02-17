// BFSDFSGame.tsx
import React, { useState, useRef, useEffect } from "react";
import ToolbarBFSDFS from "./ToolbarBFSDFS";
import GraphCanvas from "./GraphCanvas";
import BFSDFSResults, { BFSDFSResult } from "./BFSDFSResults";
import StatusBarBFSDFS from "./StatusBarBFSDFS";
import { NodeType, EdgeType } from "./GraphCanvasTypes";
import "./GraphGame.css";

/** מצב משחק: עריכה או סימולציה. */
type Mode = "edit" | "simulation";

const BFSDFSGame: React.FC = () => {
  // ----- מצב הגרף -----
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [edges, setEdges] = useState<EdgeType[]>([]);
  const [graphType, setGraphType] = useState<"מכוון" | "לא מכוון">("לא מכוון");

  // ----- מצבי משחק -----
  const [mode, setMode] = useState<Mode>("edit");
  const [editMode, setEditMode] = useState<"addNode" | "addEdge" | null>(null);
  const [message, setMessage] = useState<string>("");

  // ----- תוצאות אלגוריתמים -----
  const [bfsResult, setBfsResult] = useState<BFSDFSResult | null>(null);
  const [dfsResult, setDfsResult] = useState<BFSDFSResult | null>(null);

  // צביעת קודקודים:  "white" | "gray" | "black" | "green" ...
  const [nodeColors, setNodeColors] = useState<{ [id: number]: string }>({});

  // בחירת מקור
  const [pickSource, setPickSource] = useState<boolean>(false);
  const [sourceNode, setSourceNode] = useState<number | null>(null);

  // הצגת עץ BFS/DFS
  const [displayEdges, setDisplayEdges] = useState<EdgeType[]>([]);

  // Dragging
  const [draggingNode, setDraggingNode] = useState<number | null>(null);
  const [tempEdgeFrom, setTempEdgeFrom] = useState<number | null>(null);

  // אנימציה (צעד אחר צעד)
  const [animationRunning, setAnimationRunning] = useState<boolean>(false);
  const [animationInterval, setAnimationInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [skipRequested, setSkipRequested] = useState<boolean>(false);

  // BFS/DFS ה"סצנה" של האנימציה:
  // נשמור תור של צעדים (bfsSteps / dfsSteps), וכל צעד משנה צבע/parent/מרחק וכו'.
  const [bfsSteps, setBfsSteps] = useState<number[]>([]); // BFS order
  const [dfsSteps, setDfsSteps] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const svgRef = useRef<SVGSVGElement>(null);
  const svgWidth = 800;
  const svgHeight = 500;
  const nodeRadius = 18;
  const fontSizeNodeLabel = 16;
  const fontSizeEdgeLabel = 16;
  const offsetEdgeLabel = -10;

  // ---- פונקציית עזר לבניית רשימת שכנים (Adj List) ----
  const buildAdjList = (): { [id: number]: number[] } => {
    const adj: { [id: number]: number[] } = {};
    nodes.forEach((n) => {
      adj[n.id] = [];
    });
    edges.forEach((e) => {
      adj[e.from].push(e.to);
      if (graphType === "לא מכוון") {
        adj[e.to].push(e.from);
      }
    });
    return adj;
  };

  // ---- מעבר בין מצבי משחק ----
  const startSimulation = () => {
    if (nodes.length === 0) {
      setMessage("אין קודקודים – בנה גרף קודם.");
      return;
    }
    setMode("simulation");
    setMessage("מצב סימולציה: בחר מקור ואז הרץ BFS/DFS (ירוץ בצעדים).");
  };

  const startEditMode = () => {
    setMode("edit");
    setMessage("חזרת למצב עריכה.");
  };

  const toggleGraphType = () => {
    setGraphType((prev) => (prev === "מכוון" ? "לא מכוון" : "מכוון"));
    setMessage(
      `החלפנו את סוג הגרף ל-${graphType === "מכוון" ? "לא מכוון" : "מכוון"}.`
    );
  };

  // ---- איפוס מלא ----
  const resetGame = () => {
    setNodes([]);
    setEdges([]);
    setBfsResult(null);
    setDfsResult(null);
    setNodeColors({});
    setDisplayEdges([]);
    setSourceNode(null);
    setPickSource(false);
    setAnimationRunning(false);
    if (animationInterval) clearInterval(animationInterval);
    setAnimationInterval(null);
    setSkipRequested(false);

    setMessage("איפוס מלא בוצע. אפשר להתחיל מחדש.");
    setMode("edit");
    setEditMode(null);
  };

  // ---- בחירת מקור ----
  const pickSourceMode = () => {
    setPickSource(true);
    setMessage("בחר קודקוד שיהיה מקור (s).");
  };

  // ---- פונקציות עריכה: הוספת קודקוד, הוספת צלע ----
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (mode !== "edit" || editMode !== "addNode") return;
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newNode: NodeType = {
      id: nodes.length,
      label: `n${nodes.length}`,
      x,
      y,
    };
    setNodes([...nodes, newNode]);
    setMessage(`נוסף קודקוד ${newNode.label}`);
    setEditMode(null);
  };

  const handleNodeClick = (nodeId: number) => {
    if (mode === "edit") {
      if (editMode === "addEdge") {
        if (tempEdgeFrom === null) {
          setTempEdgeFrom(nodeId);
          setMessage("בחר קודקוד שני לצלע.");
        } else {
          if (tempEdgeFrom === nodeId) {
            setMessage("לא ניתן ליצור צלע מאותו קודקוד לעצמו.");
          } else {
            const newEdge: EdgeType = {
              id: edges.length,
              from: tempEdgeFrom,
              to: nodeId,
            };
            setEdges([...edges, newEdge]);
            setMessage("צלע נוספה בהצלחה.");
          }
          setTempEdgeFrom(null);
          setEditMode(null);
        }
      }
    } else if (mode === "simulation") {
      if (pickSource) {
        setSourceNode(nodeId);
        setPickSource(false);
        // שינוי תווית ל-"s"
        setNodes((prev) =>
          prev.map((n) => (n.id === nodeId ? { ...n, label: "s" } : n))
        );
        // צביעת הקודקוד בירוק
        setNodeColors((prev) => ({ ...prev, [nodeId]: "green" }));
        setMessage(`בחרת את n${nodeId} כמקור (s).`);
      } else {
        setMessage("אם תרצה לבחור מקור, לחץ על 'בחר מקור' קודם.");
      }
    }
  };

  // גרירת קודקודים
  const handleNodeMouseDown = (nodeId: number, e: React.MouseEvent) => {
    if (mode !== "edit") return;
    e.stopPropagation();
    setDraggingNode(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (mode === "edit" && draggingNode !== null && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setNodes((prev) =>
        prev.map((n) => (n.id === draggingNode ? { ...n, x, y } : n))
      );
    }
  };
  const handleMouseUp = () => {
    setDraggingNode(null);
  };

  const handleEdgeClick = (edgeId: number) => {
    /* לא ממומש */
  };

  // ---- BFS אנימציה צעד־אחר־צעד ----
  const runBFS = () => {
    if (sourceNode === null) {
      setMessage("לא נבחר מקור.");
      return;
    }
    // איפוס תצוגת עצים קודמים
    setDisplayEdges([]);
    setBfsResult(null);
    setDfsResult(null);
    setSkipRequested(false);

    // אתחל צבעים ל-white (או "green" אם זה מקור)
    const colors: { [id: number]: string } = {};
    nodes.forEach((n) => {
      colors[n.id] = "white";
    });
    if (nodeColors[sourceNode] === "green") {
      // נשאיר אותו "green"? או נהפוך ל"gray"?
      // החלטה: בשלב ראשון BFS, נרמוס ל"gray" כדי להמחיש תחילת הביקור
    }
    colors[sourceNode] = "gray";

    const distance: { [id: number]: number } = {};
    const parent: { [id: number]: number | null } = {};
    nodes.forEach((n) => {
      distance[n.id] = Infinity;
      parent[n.id] = null;
    });
    distance[sourceNode] = 0;

    const adj = buildAdjList();
    const queue: number[] = [sourceNode];
    const order: number[] = [];

    // הגדרת state לאנימציה
    setAnimationRunning(true);

    let stepIndex = 0; // נספור צעדים
    const interval = setInterval(() => {
      if (queue.length === 0 || skipRequested) {
        // סיום
        clearInterval(interval);
        // נצבע את כל מי שGray ב-black
        Object.keys(colors).forEach((k) => {
          if (colors[+k] === "gray") colors[+k] = "black";
        });
        setNodeColors({ ...colors });
        const result: BFSDFSResult = {
          order,
          parent,
          distance,
        };
        setBfsResult(result);
        setMessage("הסתיימה הרצת BFS בצעדים.");
        setAnimationRunning(false);
        setAnimationInterval(null);
        return;
      }

      // מוציאים u מהתור
      const u = queue.shift()!;
      order.push(u);

      // neighbors
      adj[u].forEach((v) => {
        if (colors[v] === "white" || colors[v] === "green") {
          colors[v] = "gray";
          parent[v] = u;
          distance[v] = distance[u] + 1;
          queue.push(v);
        }
      });
      // סיימנו את u => הופך black
      colors[u] = "black";
      setNodeColors({ ...colors });
      stepIndex++;
    }, 1000);

    setAnimationInterval(interval);
  };

  // ---- DFS אנימציה ----
  const runDFS = () => {
    if (sourceNode === null) {
      setMessage("לא נבחר מקור ל-DFS.");
      return;
    }
    setDisplayEdges([]);
    setBfsResult(null);
    setDfsResult(null);
    setSkipRequested(false);

    // color all white
    const colors: { [id: number]: string } = {};
    nodes.forEach((n) => {
      colors[n.id] = "white";
    });
    // source
    colors[sourceNode] = "gray";

    const parent: { [id: number]: number | null } = {};
    const discovery: { [id: number]: number } = {};
    const finish: { [id: number]: number } = {};
    nodes.forEach((n) => (parent[n.id] = null));

    let time = 0;
    let order: number[] = [];
    const adj = buildAdjList();
    setAnimationRunning(true);

    const stack = [sourceNode];
    // נייצר state שמזכיר DFS איטרטיבי:
    // נזכור "ראשית כניסה" discovery[...], "סיום" finish[...].
    const visited = new Set<number>();
    const interval = setInterval(() => {
      if (stack.length === 0 || skipRequested) {
        clearInterval(interval);
        // כל מי שנותר gray => black
        Object.keys(colors).forEach((k) => {
          if (colors[+k] === "gray") colors[+k] = "black";
        });
        setNodeColors({ ...colors });
        const result: BFSDFSResult = {
          order,
          parent,
          discovery,
          finish,
        };
        setDfsResult(result);
        setMessage("DFS בצעדים הושלם.");
        setAnimationRunning(false);
        return;
      }
      const top = stack[stack.length - 1];
      if (!visited.has(top)) {
        // כניסה ראשונה
        visited.add(top);
        time++;
        discovery[top] = time;
        colors[top] = "gray";
        order.push(top);
      }
      // חיפוש שכן לבן
      let foundWhite = false;
      for (const v of adj[top]) {
        if (colors[v] === "white" || colors[v] === "green") {
          parent[v] = top;
          colors[v] = "gray";
          stack.push(v);
          foundWhite = true;
          break;
        }
      }
      if (!foundWhite) {
        // אין שכן לבן => סיימנו top
        stack.pop();
        time++;
        finish[top] = time;
        colors[top] = "black";
      }
      setNodeColors({ ...colors });
    }, 1000);

    setAnimationInterval(interval);
  };

  const runBoth = () => {
    runBFS();
    // אחרי סיום BFS אפשר להפעיל runDFS, או פשוט לקרוא runDFS מיידית:
    // כאן נקרא מיידית (לא יקבל הנפשה סדרתית)
    // אפשר להשתמש במנגנון "async" או "setTimeout" אחרי BFS. לצורך הדגמה, נקצר.
    setTimeout(() => {
      if (!skipRequested) runDFS();
    }, 2000 + nodes.length * 1000);
  };

  // דילוג אנימציה
  const skipAnimation = () => {
    if (!animationRunning) {
      setMessage("אין אנימציה כרגע.");
      return;
    }
    setSkipRequested(true);
    setMessage("מדלג על האנימציה...");
  };

  // ---- הצגת עץ BFS / יער DFS ----
  const showBFSForest = () => {
    if (!bfsResult) {
      setMessage("אין תוצאות BFS.");
      return;
    }
    const newEdges: EdgeType[] = [];
    Object.entries(bfsResult.parent).forEach(([childStr, par]) => {
      const child = +childStr;
      if (par !== null) {
        newEdges.push({ id: 10000 + child, from: par, to: child });
      }
    });
    setDisplayEdges(newEdges);
    setMessage("מציג עץ BFS.");
  };

  const showDFSForest = () => {
    if (!dfsResult) {
      setMessage("אין תוצאות DFS.");
      return;
    }
    const newEdges: EdgeType[] = [];
    Object.entries(dfsResult.parent).forEach(([childStr, par]) => {
      const child = +childStr;
      if (par !== null) {
        newEdges.push({ id: 20000 + child, from: par, to: child });
      }
    });
    setDisplayEdges(newEdges);
    setMessage("מציג יער DFS.");
  };

  const showAllEdges = () => {
    setDisplayEdges([]);
    setMessage("מציג את כל הצלעות כעת.");
  };

  // --- עזר להציג label לקודקוד
  const getNodeLabel = (id: number): string => {
    const nd = nodes.find((n) => n.id === id);
    return nd ? nd.label : `?${id}`;
  };

  return (
    <div className="graph-game-container">
      <StatusBarBFSDFS message={message} />

      <ToolbarBFSDFS
        mode={mode}
        editMode={editMode}
        setEditMode={setEditMode}
        toggleGraphType={toggleGraphType}
        graphType={graphType}
        runBFS={runBFS}
        runDFS={runDFS}
        runBoth={runBoth}
        resetGame={resetGame}
        toggleGuide={() => setMessage("מדריך לא ממומש.")}
        startEditMode={startEditMode}
        startSimulation={startSimulation}
        pickSourceMode={pickSourceMode}
        skipAnimation={skipAnimation}
        showBFSForest={showBFSForest}
        showDFSForest={showDFSForest}
        showAllEdges={showAllEdges}
        hasBFSResult={!!bfsResult}
        hasDFSResult={!!dfsResult}
      />

      <GraphCanvas
        svgRef={svgRef}
        svgWidth={svgWidth}
        svgHeight={svgHeight}
        nodes={nodes}
        edges={displayEdges.length > 0 ? displayEdges : edges}
        directed={graphType === "מכוון"}
        nodeRadius={nodeRadius}
        fontSizeNodeLabel={fontSizeNodeLabel}
        fontSizeEdgeLabel={fontSizeEdgeLabel}
        offsetEdgeLabel={offsetEdgeLabel}
        highlightedEdges={[]}
        handleCanvasClick={handleCanvasClick}
        handleNodeClick={handleNodeClick}
        handleNodeMouseDown={handleNodeMouseDown}
        handleMouseMove={handleMouseMove}
        handleMouseUp={handleMouseUp}
        userPath={[]} // כאן אפשר לשים route, לא ממומש
        handleEdgeClick={handleEdgeClick}
        nodeColors={nodeColors}
      />

      {bfsResult && (
        <BFSDFSResults
          algorithm="BFS"
          result={bfsResult}
          nodeLabels={getNodeLabel}
        />
      )}
      {dfsResult && (
        <BFSDFSResults
          algorithm="DFS"
          result={dfsResult}
          nodeLabels={getNodeLabel}
        />
      )}
    </div>
  );
};

export default BFSDFSGame;
