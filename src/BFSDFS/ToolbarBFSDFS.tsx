// BFSDFS/ToolbarBFSDFS.tsx
/**
 * סרגל כלים למשחק BFS/DFS:
 * - עריכה: הוספת קודקודים, צלעות, איפוס, מעבר לסימולציה
 * - סימולציה: בחירת מקור, הרצת BFS/DFS/שניהם, הצגת עצים, דילוג אנימציה, איפוס...
 */
import React from "react";
import "./GraphGame.css";

interface ToolbarProps {
  mode: "edit" | "simulation";
  editMode: "addNode" | "addEdge" | null;
  setEditMode: (mode: "addNode" | "addEdge" | null) => void;
  toggleGraphType: () => void;
  graphType: "מכוון" | "לא מכוון";
  runBFS: () => void;
  runDFS: () => void;
  runBoth: () => void;
  resetGame: () => void;
  toggleGuide: () => void;
  startEditMode: () => void;
  startSimulation: () => void;
  pickSourceMode: () => void;
  skipAnimation: () => void;

  // הצגת עץ BFS/DFS
  showBFSForest: () => void;
  showDFSForest: () => void;
  showAllEdges: () => void;
  hasBFSResult: boolean;
  hasDFSResult: boolean;
}

const ToolbarBFSDFS: React.FC<ToolbarProps> = ({
  mode,
  editMode,
  setEditMode,
  toggleGraphType,
  graphType,
  runBFS,
  runDFS,
  runBoth,
  resetGame,
  toggleGuide,
  startEditMode,
  startSimulation,
  pickSourceMode,
  skipAnimation,
  showBFSForest,
  showDFSForest,
  showAllEdges,
  hasBFSResult,
  hasDFSResult,
}) => {
  return (
    <div className="toolbar">
      {mode === "edit" && (
        <>
          <button onClick={() => setEditMode("addNode")}>הוסף קודקוד</button>
          <button onClick={() => setEditMode("addEdge")}>הוסף צלע</button>
          <button onClick={toggleGraphType}>גרף: {graphType}</button>
          <button onClick={resetGame}>איפוס</button>
          <button onClick={startSimulation}>עבור לסימולציה</button>
        </>
      )}
      {mode === "simulation" && (
        <>
          <button onClick={pickSourceMode}>בחר מקור</button>
          <button onClick={runBFS}>הרץ BFS</button>
          <button onClick={runDFS}>הרץ DFS</button>
          <button onClick={runBoth}>הרץ שניהם</button>
          <button onClick={skipAnimation}>דלג אנימציה</button>
          {hasBFSResult && <button onClick={showBFSForest}>הצג עץ BFS</button>}
          {hasDFSResult && <button onClick={showDFSForest}>הצג יער DFS</button>}
          <button onClick={showAllEdges}>הצג את כל הצלעות</button>
          <button onClick={resetGame}>איפוס</button>
          <button onClick={startEditMode}>חזור לעריכה</button>
        </>
      )}
      <button onClick={toggleGuide}>מדריך</button>
    </div>
  );
};

export default ToolbarBFSDFS;
