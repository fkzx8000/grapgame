// GraphGame/Toolbar.tsx
//
// קומפוננטת סרגל הכלים. מציגה כפתורים למצב עריכה ומצב סימולציה.
// מעברית: "הוסף קודקוד", "הוסף צלע", "הגדר מקור", "הגדר יעד", ועוד.

import React from "react";
import "./GraphGame.css";

interface ToolbarProps {
  mode: "edit" | "simulation";
  editMode: "addNode" | "addEdge" | "setSource" | "setTarget" | null;
  setEditMode: (
    mode: "addNode" | "addEdge" | "setSource" | "setTarget" | null
  ) => void;
  startSimulation: () => void;
  resetGame: () => void;
  cancelEdit: () => void;
  addSourceAndTarget: () => void;
  autoSolve: () => void;
  startEditMode: () => void;
  toggleGuide: () => void;
  handleSubmitPath: () => void;
  handleResetPath: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  mode,
  editMode,
  setEditMode,
  startSimulation,
  resetGame,
  cancelEdit,
  addSourceAndTarget,
  autoSolve,
  startEditMode,
  toggleGuide,
  handleSubmitPath,
  handleResetPath,
}) => {
  return (
    <div className="toolbar">
      {mode === "edit" && (
        <>
          <button onClick={() => setEditMode("addNode")}>הוסף קודקוד</button>
          <button onClick={() => setEditMode("addEdge")}>הוסף צלע</button>
          <button onClick={() => setEditMode("setSource")}>
            הגדר מקור (s)
          </button>
          <button onClick={() => setEditMode("setTarget")}>הגדר יעד (t)</button>
          <button onClick={cancelEdit}>בטל עריכה</button>
          <button onClick={addSourceAndTarget}>הוסף s,t אוטומטי</button>
          <button onClick={startSimulation}>מעבר לסימולציה</button>
          <button onClick={autoSolve}>פתרון אוטומטי</button>
        </>
      )}
      {mode === "simulation" && (
        <>
          <button onClick={handleSubmitPath}>הגש נתיב</button>
          <button onClick={handleResetPath}>אפס נתיב</button>
          <button onClick={startEditMode}>חזור לעריכה</button>
        </>
      )}
      <button onClick={toggleGuide}>מדריך</button>
      <button onClick={resetGame}>אפס משחק</button>
    </div>
  );
};

export default Toolbar;
