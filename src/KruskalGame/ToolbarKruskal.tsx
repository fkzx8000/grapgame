// GraphGame/ToolbarKruskal.tsx
/**
 * ToolbarKruskal: סרגל כלים עבור משחק קרוסקאל.
 * - במצב עריכה: מאפשר הוספת קודקודים וצלעות, וכן התחלת קרוסקאל.
 * - במצב סימולציה: מאפשר למשתמש לבחור את הקשת המומלצת.
 * - כולל כפתור "מדריך" להצגת ההוראות.
 */
import React from "react";
import "./GraphGame.css";

interface ToolbarProps {
  mode: "edit" | "simulation";
  editMode: "addNode" | "addEdge" | null;
  setEditMode: (mode: "addNode" | "addEdge" | null) => void;
  startKruskal: () => void;
  resetGame: () => void;
  cancelEdit: () => void;
  toggleGuide: () => void;
  handleSubmitPath: () => void;
  handleResetPath: () => void;
  startEditMode: () => void;
}

const ToolbarKruskal: React.FC<ToolbarProps> = ({
  mode,
  editMode,
  setEditMode,
  startKruskal,
  resetGame,
  cancelEdit,
  toggleGuide,
  handleSubmitPath,
  handleResetPath,
  startEditMode,
}) => {
  return (
    <div className="toolbar">
      {mode === "edit" && (
        <>
          <button onClick={() => setEditMode("addNode")}>הוסף קודקוד</button>
          <button onClick={() => setEditMode("addEdge")}>הוסף צלע</button>
          <button onClick={resetGame}>אפס משחק</button>
          <button onClick={startKruskal}>התחל קרוסקאל</button>
        </>
      )}
      {mode === "simulation" && (
        <>
          <button onClick={handleSubmitPath}>בחר קשת</button>
          <button onClick={handleResetPath}>אפס בחירה</button>
          <button onClick={startEditMode}>חזור לעריכה</button>
        </>
      )}
      <button onClick={toggleGuide}>מדריך</button>
    </div>
  );
};

export default ToolbarKruskal;
