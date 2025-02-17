// BFSDFS/GraphCanvasTypes.tsx
/**
 * מגדיר את מבני הנתונים הבסיסיים של קודקוד (NodeType) וצלע (EdgeType).
 * כאן אין משקל (weight) – אם לא צריך, אפשר להסיר לגמרי, אך נשאיר 0 כברירת מחדל.
 */
export interface NodeType {
  id: number;
  label: string;
  x: number;
  y: number;
}

export interface EdgeType {
  id: number;
  from: number;
  to: number;
  weight?: number; // לא בשימוש, ערך ברירת מחדל יכול להיות 0
}
