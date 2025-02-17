"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

// הגדרות האנימציה כפי שהוגדרו
const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i) => {
    const delay = i * 0.5;
    return {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay, type: "spring", duration: 1.5, bounce: 0 },
        opacity: { delay, duration: 0.01 },
      },
    };
  },
};

// מערך של צבעי ניאון
const neonColors = [
  "#39FF14", // ירוק ניאון
  "#FF073A", // אדום ניאון
  "#0FF0FC", // כחול/טורקיז ניאון
  "#FF6EC7", // ורוד ניאון
  "#FFFF33", // צהוב ניאון
  "#FF9933", // כתום ניאון
  "#7DF9FF", // תכלת ניאון
];

// פונקציה לקבלת צבע ניאון אקראי
function getRandomNeonColor() {
  return neonColors[Math.floor(Math.random() * neonColors.length)];
}

// פונקציה המייצרת סגנון ניאון עבור הצורות, כולל זוהר מסביב בצבע שלהם
const getNeonStyle = (color) => ({
  strokeWidth: 5,
  strokeLinecap: "round",
  fill: "transparent",
  filter: `drop-shadow(0 0 0px ${color}) drop-shadow(0 0 5px ${color}) drop-shadow(0 0 10px ${color})`,
});

// סגנון ניאון לטקסט (תור/ניצחון) – ניתן לשנות את הצבע לפי רצון
const neonTextStyle = {
  fontFamily: "cursive",
  color: "#39FF14",
  textShadow: "0 0 5px #39FF14, 0 0 0px #39FF14, 0 0 15px #39FF14",
};

// קומפוננטת אנימציה לעיגול (O) עם אפקט ניאון
const AnimatedO = ({ color }) => (
  <motion.svg width="100" height="100" viewBox="0 0 200 200">
    <motion.circle
      cx="100"
      cy="100"
      r="80"
      stroke={color}
      variants={draw}
      initial="hidden"
      animate="visible"
      custom={1}
      style={getNeonStyle(color)}
    />
  </motion.svg>
);

// קומפוננטת אנימציה ל-X עם אפקט ניאון (שני קווים)
const AnimatedX = ({ color }) => (
  <motion.svg width="100" height="100" viewBox="0 0 200 200">
    <motion.line
      x1="40"
      y1="40"
      x2="160"
      y2="160"
      stroke={color}
      variants={draw}
      initial="hidden"
      animate="visible"
      custom={1}
      style={getNeonStyle(color)}
    />
    <motion.line
      x1="160"
      y1="40"
      x2="40"
      y2="160"
      stroke={color}
      variants={draw}
      initial="hidden"
      animate="visible"
      custom={1.5}
      style={getNeonStyle(color)}
    />
  </motion.svg>
);

// לוח המשחק עם בדיקת ניצחון, הודעות ניאון ואיפוס
const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState("X");
  const [winner, setWinner] = useState(null);

  // פונקציה לבדיקה האם יש ניצחון (שורות, עמודות ואלכסונים)
  const checkWinner = (board) => {
    const winningCombinations = [
      [0, 1, 2], // שורה עליונה
      [3, 4, 5], // שורה אמצעית
      [6, 7, 8], // שורה תחתונה
      [0, 3, 6], // עמודה שמאלית
      [1, 4, 7], // עמודה אמצעית
      [2, 5, 8], // עמודה ימנית
      [0, 4, 8], // אלכסון ראשי
      [2, 4, 6], // אלכסון משני
    ];
    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      if (
        board[a] &&
        board[b] &&
        board[c] &&
        board[a].player === board[b].player &&
        board[a].player === board[c].player
      ) {
        return board[a].player;
      }
    }
    return null;
  };

  // טיפול בלחיצה על תא
  const handleClick = (index) => {
    if (board[index] || winner) return; // אם התא תפוס או המשחק כבר הסתיים
    const color = getRandomNeonColor();
    const newBoard = [...board];
    newBoard[index] = { player: turn, color };
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
    } else {
      setTurn(turn === "X" ? "O" : "X");
    }
  };

  // אתחול מחדש של המשחק
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setTurn("X");
    setWinner(null);
  };

  return (
    <div
      style={{
        textAlign: "center",
        backgroundColor: "#000",
        minHeight: "100vh",
        paddingTop: "20px",
      }}
    >
      {/* הצגת תור או ניצחון בטקסט עם אפקט ניאון */}
      {winner ? (
        <h1 style={neonTextStyle}>
          ניצחון: {winner === "X" ? "אקס" : "עיגול"}
        </h1>
      ) : (
        <h1 style={neonTextStyle}>תור של: {turn === "X" ? "אקס" : "עיגול"}</h1>
      )}

      {/* לוח המשחק (3x3) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 100px)",
          gridTemplateRows: "repeat(3, 100px)",
          gap: "10px",
          justifyContent: "center",
          margin: "20px auto",
        }}
      >
        {board.map((cell, idx) => (
          <div
            key={idx}
            onClick={() => handleClick(idx)}
            style={{
              width: "100px",
              height: "100px",
              border: "1px solid #333",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: winner ? "not-allowed" : "pointer",
              backgroundColor: "#111",
            }}
          >
            {cell &&
              (cell.player === "X" ? (
                <AnimatedX color={cell.color} />
              ) : (
                <AnimatedO color={cell.color} />
              ))}
          </div>
        ))}
      </div>

      {/* כפתור איפוס המשחק */}
      <button
        onClick={resetGame}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          borderRadius: "5px",
          border: "none",
          backgroundColor: "#4CAF50",
          color: "#fff",
          marginTop: "20px",
        }}
      >
        אתחל משחק
      </button>
    </div>
  );
};

export default TicTacToe;
