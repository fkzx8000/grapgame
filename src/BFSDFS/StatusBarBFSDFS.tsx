// BFSDFS/StatusBarBFSDFS.tsx
/**
 * מציג הודעות למשתמש (message).
 */
import React from "react";
import "./GraphGame.css";

interface StatusBarProps {
  message: string;
}

const StatusBarBFSDFS: React.FC<StatusBarProps> = ({ message }) => {
  return (
    <div className="flow-status-bar">
      <div className="message-box">{message}</div>
    </div>
  );
};

export default StatusBarBFSDFS;
