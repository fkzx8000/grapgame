// GraphGame/GraphGameKruskal.tsx
/**
 * GraphGameKruskal:
 * קומפוננטה ראשית למשחק קרוסקאל.
 * המשתמש בונה גרף לא מכוון עם משקלים, ואז עובר למצב סימולציה לפי אלגוריתם קרוסקאל.
 * המערכת מדריכה אותו בבחירת הקשתות לעץ מינימלי (Group A).
 * הקשתות הנבחרות יוצגו בתור "קבוצה A" (באדום) בחלק העליון,
 * ובסיום, אם נבחרו כל הקשתות הדרושות, תופיע הודעת "כל הכבוד, הצלחת!".
 */
import React, { useState, useRef } from "react";
import ToolbarKruskal from "./ToolbarKruskal";
import StatusBarKruskal from "./StatusBarKruskal";
import GraphCanvas from "./GraphCanvas";
import SolutionStepsKruskal from "./SolutionStepsKruskal";
import MSTGroup from "./MSTGroup";
import { NodeType, EdgeType } from "./GraphCanvasTypes";
import "./GraphGame.css";

const GraphGameKruskal: React.FC = () => {
  // מצב הגרף
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [edges, setEdges] = useState<EdgeType[]>([]);
  // קשתות שנבחרו ל-MST (Group A)
  const [mstEdges, setMstEdges] = useState<EdgeType[]>([]);
  // מצב המשחק: עריכה או סימולציה
  const [mode, setMode] = useState<"edit" | "simulation">("edit");
  const [editMode, setEditMode] = useState<"addNode" | "addEdge" | null>(null);
  const [message, setMessage] = useState<string>("");

  // הקשת המומלצת הנוכחית
  const [currentCandidate, setCurrentCandidate] = useState<EdgeType | null>(
    null
  );

  // מונים
  const [nodeCounter, setNodeCounter] = useState<number>(0);
  const [edgeCounter, setEdgeCounter] = useState<number>(0);

  // שלבי פתרון (Group A)
  const [solutionSteps, setSolutionSteps] = useState<
    { edgeId: number; weight: number }[]
  >([]);

  const svgRef = useRef<SVGSVGElement>(null);
  const svgWidth = 800;
  const svgHeight = 500;
  const nodeRadius = 18;
  const fontSizeNodeLabel = 16;
  const fontSizeEdgeLabel = 16;
  const offsetEdgeLabel = -10;
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // ---- Union-Find functions ----
  const initializeUF = (): number[] => {
    const parent = new Array(nodes.length);
    for (let i = 0; i < nodes.length; i++) {
      parent[i] = i;
    }
    return parent;
  };

  const find = (parent: number[], i: number): number => {
    if (parent[i] !== i) {
      parent[i] = find(parent, parent[i]);
    }
    return parent[i];
  };

  const union = (parent: number[], x: number, y: number) => {
    const rx = find(parent, x);
    const ry = find(parent, y);
    parent[rx] = ry;
  };

  // ---- מצב עריכה: הוספת קודקודים וצלעות ----
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (mode !== "edit" || editMode !== "addNode") return;
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
    setNodes([...nodes, newNode]);
    setNodeCounter(nodeCounter + 1);
    setMessage(`נוסף קודקוד id=${newNode.id}.`);
    setEditMode(null);
  };

  // הוספת צלע – המשתמש בוחר שני קודקודים
  const [tempEdgeFrom, setTempEdgeFrom] = useState<number | null>(null);
  const handleEditModeNodeClick = (nodeId: number) => {
    if (!editMode) return;
    if (editMode === "addEdge") {
      if (tempEdgeFrom === null) {
        setTempEdgeFrom(nodeId);
        setMessage("בחר קודקוד שני לצלע.");
      } else {
        if (tempEdgeFrom === nodeId) {
          setMessage("לא ניתן ליצור צלע מאותו קודקוד לעצמו.");
        } else {
          const weightStr = prompt("הכנס משקל לצלע:");
          if (weightStr && parseInt(weightStr) > 0) {
            const newEdge: EdgeType = {
              id: edgeCounter,
              from: tempEdgeFrom,
              to: nodeId,
              weight: parseInt(weightStr),
            };
            setEdges([...edges, newEdge]);
            setEdgeCounter(edgeCounter + 1);
            setMessage("צלע נוספה בהצלחה.");
          } else {
            setMessage("משקל לא תקין.");
          }
        }
        setTempEdgeFrom(null);
        setEditMode(null);
      }
    }
  };

  const handleNodeClick = (nodeId: number) => {
    if (mode === "edit") {
      handleEditModeNodeClick(nodeId);
    } else if (mode === "simulation") {
      setMessage("במצב סימולציה יש ללחוץ על הצלעות המומלצות.");
    }
  };

  const handleNodeMouseDown = (nodeId: number, e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    // אפשר להוסיף גרירת קודקודים אם נדרש
  };

  const handleMouseUp = () => {};

  // ---- מצב סימולציה (קרוסקאל) ----
  // התחלת קרוסקאל: מעבר ממצב עריכה לסימולציה ובחירת הקשת המומלצת הראשונה
  const startKruskal = () => {
    if (nodes.length === 0 || edges.length === 0) {
      setMessage(
        "יש לבנות גרף מלא (קודקודים וצלעות עם משקלים) לפני תחילת קרוסקאל."
      );
      return;
    }
    setMode("simulation");
    const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
    const uf = initializeUF();
    let candidate: EdgeType | null = null;
    for (const ed of sortedEdges) {
      const root1 = find(uf, ed.from);
      const root2 = find(uf, ed.to);
      if (root1 !== root2) {
        candidate = ed;
        break;
      }
    }
    setCurrentCandidate(candidate);
    if (candidate) {
      setMessage(`בחר את הקשת: ${getEdgeDesc(candidate)}`);
    } else {
      setMessage("לא נמצאה קשת מתאימה.");
    }
  };

  // עדכון Union-Find מבוסס MST עד כה
  const buildUFFromMST = (): number[] => {
    const parent = new Array(nodes.length);
    for (let i = 0; i < nodes.length; i++) {
      parent[i] = i;
    }
    mstEdges.forEach((ed) => {
      union(parent, ed.from, ed.to);
    });
    return parent;
  };

  // לחיצה על צלע במצב סימולציה - המשתמש צריך ללחוץ על הקשת המומלצת
  const handleEdgeClick = (edgeId: number) => {
    if (mode !== "simulation" || !currentCandidate) return;
    if (edgeId !== currentCandidate.id) {
      setMessage(
        `לא בחרת את הקשת הנכונה. הקשת הנכונה היא: ${getEdgeDesc(
          currentCandidate
        )}`
      );
      return;
    }
    // אם בחרת נכון, הוסף את הקשת ל-MST (Group A)
    const newMstEdges = [...mstEdges, currentCandidate];
    setMstEdges(newMstEdges);
    setSolutionSteps([
      ...solutionSteps,
      { edgeId: currentCandidate.id, weight: currentCandidate.weight },
    ]);
    setMessage(`הקשת ${getEdgeDesc(currentCandidate)} נוספה לעץ המינימלי.`);
    const uf = buildUFFromMST();
    union(uf, currentCandidate.from, currentCandidate.to);
    const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
    let nextCandidate: EdgeType | null = null;
    for (const ed of sortedEdges) {
      if (newMstEdges.some((m) => m.id === ed.id)) continue;
      const r1 = find(uf, ed.from);
      const r2 = find(uf, ed.to);
      if (r1 !== r2) {
        nextCandidate = ed;
        break;
      }
    }
    setCurrentCandidate(nextCandidate);
    if (nextCandidate) {
      setMessage(`בחר את הקשת הבאה: ${getEdgeDesc(nextCandidate)}`);
    } else {
      if (newMstEdges.length === nodes.length - 1) {
        setMessage(
          `כל הכבוד, הצלחת! העץ המינימלי הושלם. סך המשקל: ${newMstEdges.reduce(
            (s, ed) => s + ed.weight,
            0
          )}.`
        );
      } else {
        setMessage("לא נמצאה קשת מתאימה נוספת. יתכן שהגרף אינו מחובר.");
      }
    }
  };

  // פונקציה לקבלת תיאור של צלע
  const getEdgeDesc = (edge: EdgeType): string => {
    const n1 = nodes.find((n) => n.id === edge.from)?.label || edge.from;
    const n2 = nodes.find((n) => n.id === edge.to)?.label || edge.to;
    return `${n1} - ${n2} (משקל: ${edge.weight})`;
  };

  // כפתורים נוספים במצב סימולציה
  const startEditMode = () => {
    setMode("edit");
    setEditMode(null);
    setMessage("חזרת למצב עריכה.");
  };

  const toggleGuide = () => {
    setShowGuide(!showGuide);
  };

  const resetGame = () => {
    setNodes([]);
    setEdges([]);
    setMstEdges([]);
    setMode("edit");
    setEditMode(null);
    setMessage("");
    setNodeCounter(0);
    setEdgeCounter(0);
    setSolutionSteps([]);
    setCurrentCandidate(null);
  };

  const cancelEdit = () => {
    setEditMode(null);
    setTempEdgeFrom(null);
    setMessage("ביטלת עריכה.");
  };

  // ---- ממשק להוספת מקור/יעד לא מכוון (לא נדרש לקרוסקאל, אך ניתן להוסיף אם רוצים) ----
  // כאן לא נשתמש – בעיקר המשחק מתמקד בגרף לא מכוון עם משקלים.

  // ---- מציג את קבוצה A (MST) בתור מערך בחלק העליון ----
  const getEdgeDescription = (edge: EdgeType): string => {
    return getEdgeDesc(edge);
  };

  // ---- מדריך למשתמש ----
  const gameGuide = (
    <div className="guide-container">
      <h3>מדריך - קרוסקאל</h3>
      <ul>
        <li>
          במצב עריכה: בנה גרף לא מכוון על ידי הוספת קודקודים וצלעות עם משקלים.
        </li>
        <li>לחץ על "התחל קרוסקאל" כדי להתחיל את הסימולציה.</li>
        <li>המערכת תמיין את הצלעות לפי משקל ותציג את הקשת המומלצת.</li>
        <li>לחץ על הקשת המומלצת – היא תתווסף לקבוצה A (מצוינת בצבע אדום).</li>
        <li>המשך עד שהעץ המינימלי מוכן (מספר הקשתות = מספר קודקודים - 1).</li>
        <li>בסיום, תופיע הודעת "כל הכבוד, הצלחת!" עם סך המשקל של העץ.</li>
      </ul>
      <p>בהצלחה!</p>
    </div>
  );

  // נתונים נוספים (במקרה של קרוסקאל, אנו לא מחשבים זרימה אלא בונים MST)
  const currentFlow = 0;
  const additionalFlow = 0;

  return (
    <div className="graph-game-container">
      {/* הצגת קבוצת הקשתות (Group A) בחלק העליון */}
      <MSTGroup
        mstEdges={mstEdges}
        nodes={nodes}
        getEdgeDescription={getEdgeDescription}
      />
      {showGuide && gameGuide}
      <StatusBarKruskal message={message} />
      <ToolbarKruskal
        mode={mode}
        editMode={editMode}
        setEditMode={setEditMode}
        startKruskal={startKruskal}
        resetGame={resetGame}
        cancelEdit={cancelEdit}
        toggleGuide={toggleGuide}
        handleSubmitPath={() => {}}
        handleResetPath={() => {}}
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
        highlightedEdges={mstEdges.map((ed) => ed.id)} // {/* קשתות ב-MST יוצגו, וניתן להדגיש אותן */}
        handleCanvasClick={handleCanvasClick}
        handleNodeClick={handleNodeClick}
        handleNodeMouseDown={handleNodeMouseDown}
        handleMouseMove={handleMouseMove}
        handleMouseUp={handleMouseUp}
        userPath={[]} // לא רלוונטי לקרוסקאל
        handleEdgeClick={handleEdgeClick}
      />
      {mode === "simulation" && solutionSteps.length > 0 && (
        <SolutionStepsKruskal
          steps={solutionSteps}
          getEdgeDescription={(edgeId: number) => {
            const ed = edges.find((e) => e.id === edgeId);
            return ed ? getEdgeDesc(ed) : "";
          }}
        />
      )}
    </div>
  );
};

export default GraphGameKruskal;
