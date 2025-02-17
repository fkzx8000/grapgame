// GraphGame/StatusBarKruskal.tsx
/**
 * StatusBarKruskal: מציג הודעות למשתמש (לדוגמה, מה על המשתמש לעשות כעת).
 */
import React from "react";
import "./GraphGame.css";

interface StatusBarProps {
  message: string;
}

const StatusBarKruskal: React.FC<StatusBarProps> = ({ message }) => {
  return (
    <div className="flow-status-bar">
      <div className="message-box">{message}</div>
    </div>
  );
};

export default StatusBarKruskal;
