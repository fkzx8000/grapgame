// BFSDFS/BFSDFSResults.tsx
/**
 * מציג תוצאות BFS/DFS בטבלה.
 * BFS - מציג distance.
 * DFS - מציג discovery/finish.
 */
import React from "react";
import "./GraphGame.css";

export interface BFSDFSResult {
  order: number[]; // סדר ביקור
  parent: { [nodeId: number]: number | null };
  distance?: { [nodeId: number]: number }; // BFS
  discovery?: { [nodeId: number]: number }; // DFS
  finish?: { [nodeId: number]: number }; // DFS
}

interface BFSDFSResultsProps {
  algorithm: "BFS" | "DFS";
  result: BFSDFSResult;
  nodeLabels: (id: number) => string; // פונקציה להמרת מזהה לתווית
}

const BFSDFSResults: React.FC<BFSDFSResultsProps> = ({
  algorithm,
  result,
  nodeLabels,
}) => {
  const nodesSorted = Object.keys(result.parent)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="solution-steps">
      <h3>תוצאות {algorithm}</h3>

      <p>
        <strong>סדר ביקור:</strong> {result.order.map(nodeLabels).join(" -> ")}
      </p>

      <table className="bfsdfs-table">
        <thead>
          <tr>
            <th>קודקוד</th>
            <th>Parent</th>
            {algorithm === "BFS" && result.distance && <th>מרחק</th>}
            {algorithm === "DFS" && result.discovery && <th>G</th>}
            {algorithm === "DFS" && result.finish && <th>F</th>}
          </tr>
        </thead>
        <tbody>
          {nodesSorted.map((nId) => {
            const p = result.parent[nId];
            return (
              <tr key={nId}>
                <td>{nodeLabels(nId)}</td>
                <td>{p === null ? "-" : nodeLabels(p)}</td>
                {algorithm === "BFS" && result.distance && (
                  <td>
                    {result.distance[nId] !== undefined
                      ? result.distance[nId]
                      : "-"}
                  </td>
                )}
                {algorithm === "DFS" && (
                  <>
                    <td>
                      {result.discovery && result.discovery[nId] !== undefined
                        ? result.discovery[nId]
                        : "-"}
                    </td>
                    <td>
                      {result.finish && result.finish[nId] !== undefined
                        ? result.finish[nId]
                        : "-"}
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BFSDFSResults;
