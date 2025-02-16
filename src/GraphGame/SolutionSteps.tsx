// GraphGame/SolutionSteps.tsx
//
// מציגה את שלבי הפתרון (נתיבים והקיבולות) בסדר כרונולוגי כאשר מריצים פתרון אוטומטי.

import React from "react";
import "./GraphGame.css";

interface StepData {
  path: number[];
  bottleneck: number;
}

interface SolutionStepsProps {
  steps: StepData[];
  getNodeLabel: (nodeId: number) => string;
}

const SolutionSteps: React.FC<SolutionStepsProps> = ({
  steps,
  getNodeLabel,
}) => {
  return (
    <div className="solution-steps">
      <h3>שלבי הפתרון (נתיבי הרחבה וצוואר בקבוק)</h3>
      <ul>
        {steps.map((step, index) => (
          <li key={index}>
            נתיב {index + 1}: {step.path.map(getNodeLabel).join(" -> ")} (צוואר
            בקבוק: {step.bottleneck})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SolutionSteps;
