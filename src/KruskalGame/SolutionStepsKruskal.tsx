// GraphGame/SolutionStepsKruskal.tsx
/**
 * SolutionStepsKruskal: מציג את הקשתות שנבחרו עד כה (Group A) עם המשקלים שלהן.
 */
import React from "react";
import "./GraphGame.css";

interface StepData {
  edgeId: number;
  weight: number;
}

interface SolutionStepsProps {
  steps: StepData[];
  getEdgeDescription: (edgeId: number) => string;
}

const SolutionStepsKruskal: React.FC<SolutionStepsProps> = ({
  steps,
  getEdgeDescription,
}) => {
  return (
    <div className="solution-steps">
      <h3>קבוצת קשתות (Group A)</h3>
      <ul>
        {steps.map((step, index) => (
          <li key={index}>
            קשת {index + 1}: {getEdgeDescription(step.edgeId)} (משקל:{" "}
            {step.weight})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SolutionStepsKruskal;
