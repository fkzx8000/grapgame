// SolutionSteps.tsx
import React from "react";
import "./GraphGame.css";

interface SolutionStep {
  path: number[];
  bottleneck: number;
}

interface SolutionStepsProps {
  steps: SolutionStep[];
  getNodeLabel: (nodeId: number) => string;
}

const SolutionSteps: React.FC<SolutionStepsProps> = ({
  steps,
  getNodeLabel,
}) => {
  return (
    <div className="solution-steps">
      <h3>שלבי הפתרון (נתיבים והקיבולות):</h3>
      <ul>
        {steps.map((step, index) => (
          <li key={index}>
            <strong>#{index + 1}</strong>:{" "}
            {step.path.map(getNodeLabel).join(" -> ")} (קיבולת:{" "}
            {step.bottleneck})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SolutionSteps;
