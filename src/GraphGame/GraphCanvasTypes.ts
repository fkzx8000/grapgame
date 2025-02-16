// GraphGame/GraphCanvasTypes.ts
//
// קובץ שמגדיר את הטיפוסים הבסיסיים (ממשקי TypeScript) עבור קודקודים וצלעות.
// NodeType - מייצג קודקוד בגרף, EdgeType - מייצג צלע עם קיבולת וזרימה.

export interface NodeType {
  id: number; // מזהה ייחודי
  label: string; // תווית (s, t, או אותיות אחרות)
  x: number; // מיקום בציר x
  y: number; // מיקום בציר y
}

export interface EdgeType {
  id: number; // מזהה ייחודי לצלע
  from: number; // מזהה הקודקוד ממנו יוצאת הצלע
  to: number; // מזהה הקודקוד אליו היא מגיעה
  capacity: number; // קיבולת מקסימלית של הצלע
  flow: number; // זרימה נוכחית בצלע
}
