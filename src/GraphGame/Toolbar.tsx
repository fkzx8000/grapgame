// Toolbar.tsx
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
}

const Toolbar: React.FC<ToolbarProps> = ({
  mode,
  // editMode,
  setEditMode,
  startSimulation,
  resetGame,
  cancelEdit,
  addSourceAndTarget,
  autoSolve,
  startEditMode,
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
          <button onClick={addSourceAndTarget}>הוסף s,t</button>
          <button onClick={startSimulation}>סימולציה</button>
          <button onClick={autoSolve}>פתרון אוטומטי</button>
        </>
      )}
      {mode === "simulation" && (
        <>
          <button
            onClick={() => {
              /* ניתן להוסיף כאן פונקציה להגשת נתיב */
            }}
          >
            הגש נתיב
          </button>
          <button
            onClick={() => {
              /* ניתן להוסיף כאן פונקציה לאיפוס נתיב */
            }}
          >
            אפס נתיב
          </button>
          <button onClick={startEditMode}>מצב עריכה</button>
        </>
      )}
      <button onClick={resetGame}>אפס משחק</button>
    </div>
  );
};

export default Toolbar;
