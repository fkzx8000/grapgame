// GraphGame/MSTGroup.tsx
/**
 * MSTGroup: קומפוננטה המציגה את קבוצת הקשתות (Group A) שנבחרו עד כה (עץ מינימלי)
 * בצורה אופקית בחלק העליון של המסך.
 * היא מקבלת את מערך הקשתות ב־MST, את רשימת הקודקודים ואת הפונקציה getEdgeDescription
 * שמחזירה תיאור עבור כל קשת.
 */
import React from "react";
import { EdgeType, NodeType } from "./GraphCanvasTypes";
import "./GraphGame.css";

interface MSTGroupProps {
  mstEdges: EdgeType[];
  nodes: NodeType[];
  getEdgeDescription: (edge: EdgeType) => string;
}

const MSTGroup: React.FC<MSTGroupProps> = ({
  mstEdges,
  nodes,
  getEdgeDescription,
}) => {
  return (
    <div className="mst-group">
      <h3>קבוצה A (קשתות נבחרות)</h3>
      <div className="mst-edge-list">
        {mstEdges.map((edge) => (
          <div key={edge.id} className="mst-edge-item">
            {getEdgeDescription(edge)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MSTGroup;
