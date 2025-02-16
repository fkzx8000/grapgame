// GraphGame/StatusBar.tsx
//
// קומפוננטה להצגת מצב הזרימה (Flow) ופוטנציאל הזרימה הנוסף,
// וכן הודעות (message) למשתמש. כשתרצה לעבור לעברית מלא:

import React from "react";
import "./GraphGame.css";

interface StatusBarProps {
  currentFlow: number;
  additionalFlow: number;
  message: string;
}

const StatusBar: React.FC<StatusBarProps> = ({
  currentFlow,
  additionalFlow,
  message,
}) => {
  return (
    <div className="flow-status-bar">
      <div className="flow-status">
        <strong>זרימה נוכחית:</strong> {currentFlow} &nbsp;|&nbsp;
        <strong>פוטנציאל זרימה נוספת:</strong> {additionalFlow}
      </div>
      <div className="message-box">{message}</div>
    </div>
  );
};

export default StatusBar;
