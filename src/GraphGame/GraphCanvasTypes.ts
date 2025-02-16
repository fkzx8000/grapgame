// GraphCanvasTypes.ts
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
  capacity: number;
  flow: number;
}
