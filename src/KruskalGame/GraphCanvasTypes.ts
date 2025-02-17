// GraphGame/GraphCanvasTypes.ts
// הגדרות טיפוסים עבור קודקודים וצלעות.

export interface NodeType {
  id: number; // מזהה ייחודי
  label: string; // תווית (למשל, "s", "t" או "nX")
  x: number; // מיקום ב-X
  y: number; // מיקום ב-Y
}

export interface EdgeType {
  id: number; // מזהה ייחודי לצלע
  from: number; // מזהה הקודקוד שממנו יוצאת הצלע
  to: number; // מזהה הקודקוד שאליו הצלע מגיעה
  weight: number; // המשקל (משקל) של הצלע
}
