import { useState } from "react";

const WINS = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700&family=Rajdhani:wght@400;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .ttt-root {
    min-height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(ellipse at 20% 50%, #1a0533 0%, #0a0a1a 50%, #001233 100%);
    font-family: 'Rajdhani', sans-serif;
    padding: 2rem 1rem;
    position: relative;
    overflow: hidden;
  }
  
  .star {
  position: fixed;
  border-radius: 50%;
  background: white;
  pointer-events: none;
  z-index: 0;
}

  /* NAME SCREEN */
  .name-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 28px;
    width: 100%;
    max-width: 500px;
  }
  .name-heading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .name-title {
   font-family: 'Orbitron', monospace;
    font-size: 28px;
    color: #fff;
    text-align: center;
    text-shadow: 0 0 30px #a78bfa, 0 0 60px #7c3aed;
    letter-spacing: 4px;
  }
  .name-subtitle {
    font-size: 13px;
    color: rgba(255,255,255,0.4);
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .name-cards {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
  }
  .name-card {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 18px;
    padding: 24px 28px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    flex: 1;
    min-width: 160px;
    max-width: 200px;
    transition: all 0.3s;
  }

  .name-card:focus-within {
  border-color: rgba(255,255,255,0.5);
  background: rgba(255,255,255,0.12);
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.3);
}
.name-card.x-card:focus-within {
  border-color: rgba(96,165,250,0.7);
  box-shadow: 0 0 25px rgba(59,130,246,0.3);
}
.name-card.o-card:focus-within {
  border-color: rgba(244,114,182,0.7);
  box-shadow: 0 0 25px rgba(236,72,153,0.3);
}
  .name-card-label {
    font-size: 12px;
    letter-spacing: 3px;
    text-transform: uppercase;
  }
  .name-card.x-card .name-card-label { color: #60a5fa; }
  .name-card.o-card .name-card-label { color: #f472b6; }
  .name-card-symbol {
    font-family: 'Orbitron', monospace;
    font-size: 44px;
    font-weight: 700;
    line-height: 1;
  }
  .name-card.x-card .name-card-symbol { color: #60a5fa; text-shadow: 0 0 20px #3b82f6, 0 0 40px #1d4ed8; }
  .name-card.o-card .name-card-symbol { color: #f472b6; text-shadow: 0 0 20px #ec4899, 0 0 40px #be185d; }
  .name-input {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 10px;
    color: #fff;
    font-size: 15px;
    font-family: 'Rajdhani', sans-serif;
    font-weight: 600;
    padding: 8px 12px;
    width: 100%;
    text-align: center;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
    .name-input:not(:placeholder-shown) {
  border-color: rgba(255,255,255,0.4);
  box-shadow: 0 0 12px rgba(255,255,255,0.1);
}
  .name-card.x-card .name-input:focus { border-color: #60a5fa; box-shadow: 0 0 14px rgba(96,165,250,0.3); }
  .name-card.o-card .name-input:focus { border-color: #f472b6; box-shadow: 0 0 14px rgba(244,114,182,0.3); }
  .name-input::placeholder { color: rgba(255,255,255,0.25); }
  .start-btn {
    padding: 14px 48px;
    background: linear-gradient(135deg, rgba(124,58,237,0.4), rgba(236,72,153,0.3));
    border: 1px solid rgba(167,139,250,0.5);
    border-radius: 12px;
    color: #e9d5ff;
    font-family: 'Orbitron', monospace;
    font-size: 12px;
    letter-spacing: 3px;
    cursor: pointer;
    transition: all 0.25s;
    text-transform: uppercase;
  }
  .start-btn:hover {
    background: linear-gradient(135deg, rgba(124,58,237,0.7), rgba(236,72,153,0.5));
    box-shadow: 0 0 30px rgba(167,139,250,0.4);
    color: #fff;
  }
  .start-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  /* GAME SCREEN */
  .game-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    width: 100%;
    max-width: 420px;
  }
  .game-title {
    font-family: 'Orbitron', monospace;
    font-size: 22px;
    color: #fff;
    letter-spacing: 4px;
    text-shadow: 0 0 20px #a78bfa, 0 0 40px #7c3aed;
  }
  .score-row {
    display: flex;
    gap: 12px;
    width: 100%;
    justify-content: center;
  }
  .score-card {
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    padding: 10px 16px;
    text-align: center;
    flex: 1;
    max-width: 120px;
  }
  .score-name {
    font-size: 11px;
    letter-spacing: 1px;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .score-card.x-score .score-name { color: #93c5fd; }
  .score-card.o-score .score-name { color: #f9a8d4; }
  .score-card.d-score .score-name { color: rgba(255,255,255,0.4); }
  .score-val {
    font-family: 'Orbitron', monospace;
    font-size: 26px;
    font-weight: 700;
    margin-top: 4px;
  }
  .score-card.x-score .score-val { color: #60a5fa; text-shadow: 0 0 10px #3b82f6; }
  .score-card.o-score .score-val { color: #f472b6; text-shadow: 0 0 10px #ec4899; }
  .score-card.d-score .score-val { color: #9ca3af; }

  .score-card.active-turn {
  border-color: rgba(255,255,255,0.4);
  transform: scale(1.06);
  transition: all 0.3s;
}
.score-card.x-score.active-turn {
  border-color: rgba(96,165,250,0.7);
  box-shadow: 0 0 20px rgba(59,130,246,0.3);
}
.score-card.o-score.active-turn {
  border-color: rgba(244,114,182,0.7);
  box-shadow: 0 0 20px rgba(236,72,153,0.3);
}

  .status-box {
    font-size: 17px;
    font-weight: 600;
    letter-spacing: 1px;
    color: rgba(255,255,255,0.8);
    min-height: 28px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
    .blink {
  animation: blinkAnim 1.2s ease infinite;
}
@keyframes blinkAnim {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}
  .status-box .name-x { color: #60a5fa; text-shadow: 0 0 8px #3b82f6; }
  .status-box .name-o { color: #f472b6; text-shadow: 0 0 8px #ec4899; }

  .glass-board {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 22px;
    padding: 16px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.5);
  }
  .board-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .cell {
    width: 90px;
    height: 90px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-family: 'Orbitron', monospace;
    font-size: 36px;
    font-weight: 700;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    transition: background 0.2s, transform 0.15s;
    user-select: none;
  }

  .cell.filled { cursor: default; }
  .cell.cell-x {
    background: linear-gradient(135deg, rgba(37,99,235,0.25), rgba(96,165,250,0.12));
    border-color: rgba(96,165,250,0.5);
    color: #60a5fa;
    text-shadow: 0 0 18px #3b82f6, 0 0 35px #1d4ed8;
    box-shadow: 0 0 20px rgba(59,130,246,0.2), inset 0 0 20px rgba(59,130,246,0.08);
  }
  .cell.cell-o {
    background: linear-gradient(135deg, rgba(190,24,93,0.25), rgba(244,114,182,0.12));
    border-color: rgba(244,114,182,0.5);
    color: #f472b6;
    text-shadow: 0 0 18px #ec4899, 0 0 35px #be185d;
    box-shadow: 0 0 20px rgba(236,72,153,0.2), inset 0 0 20px rgba(236,72,153,0.08);
  }
  .cell.pop { animation: popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards; }
  .cell.shake { animation: shakePop 0.35s ease; }
  .cell.winner { animation: winGlow 0.7s ease infinite alternate; }
  .cell.winner.cell-x {
    box-shadow: 0 0 30px rgba(59,130,246,0.7), 0 0 60px rgba(59,130,246,0.3);
    border-color: #60a5fa;
  }
  .cell.winner.cell-o {
    box-shadow: 0 0 30px rgba(236,72,153,0.7), 0 0 60px rgba(236,72,153,0.3);
    border-color: #f472b6;
  }
    .board-grid[data-turn="X"] .cell:hover:not(.filled):not(.game-over) {
  background: rgba(59,130,246,0.15);
  border-color: rgba(96,165,250,0.4);
  transform: scale(1.05);
}

.board-grid[data-turn="O"] .cell:hover:not(.filled):not(.game-over) {
  background: rgba(236,72,153,0.15);
  border-color: rgba(244,114,182,0.4);
  transform: scale(1.05);
}

  @keyframes popIn {
    0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes shakePop {
    0%   { transform: scale(1); }
    20%  { transform: scale(0.93) rotate(-4deg); }
    40%  { transform: scale(1.06) rotate(3deg); }
    60%  { transform: scale(0.96) rotate(-2deg); }
    80%  { transform: scale(1.02) rotate(1deg); }
    100% { transform: scale(1); }
  }
  @keyframes winGlow {
    0%   { transform: scale(1); filter: brightness(1); }
    100% { transform: scale(1.08); filter: brightness(1.3); }
  }

  .btn-row { display: flex; gap: 12px; }
  .action-btn {
    padding: 10px 28px;
    border-radius: 10px;
    font-family: 'Orbitron', monospace;
    font-size: 10px;
    letter-spacing: 2px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-new {
    background: rgba(167,139,250,0.15);
    border: 1px solid rgba(167,139,250,0.45);
    color: #c4b5fd;
  }
  .btn-new:hover { background: rgba(167,139,250,0.3); color: #fff; }
  .btn-change {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.15);
    color: rgba(255,255,255,0.45);
  }
  .btn-change:hover { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); }

  .confetti-wrap {
    position: fixed; top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none; z-index: 999; overflow: hidden;
  }
  .confetti-piece {
    position: absolute; top: -20px; border-radius: 2px;
    animation: confettiFall linear forwards;
  }
  @keyframes confettiFall {
    to { transform: translateY(110vh) rotate(720deg); opacity: 0; }
  }

  @media (max-width: 420px) {
    .cell { width: 80px; height: 80px; font-size: 30px; }
    .name-cards { flex-direction: column; align-items: center; }
    .name-card { max-width: 260px; width: 100%; }
  }
`;

function Stars() {
  const stars = Array.from({ length: 150 }, (_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    opacity: Math.random() * 0.7 + 0.3,
  }));
  return (
    <>
      {stars.map(s => (
        <div key={s.id} className="star" style={{
          top: `${s.top}%`,
          left: `${s.left}%`,
          width: s.size,
          height: s.size,
          opacity: s.opacity,
        }} />
      ))}
    </>
  );
}

function Confetti({ show }) {
  if (!show) return null;
  const pieces = Array.from({ length: 70 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: Math.random() * 8 + 5,
    duration: Math.random() * 1.5 + 1.5,
    delay: Math.random() * 1.2,
    color: ["#60a5fa","#f472b6","#a78bfa","#facc15","#34d399","#fb923c"][Math.floor(Math.random()*6)],
  }));
  return (
    <div className="confetti-wrap">
      {pieces.map(p => (
        <div key={p.id} className="confetti-piece" style={{
          left: `${p.left}%`,
          width: p.size, height: p.size,
          background: p.color,
          animationDuration: `${p.duration}s`,
          animationDelay: `${p.delay}s`,
        }} />
      ))}
    </div>
  );
}

export default function App() {
  const [phase, setPhase] = useState("names");
  const [names, setNames] = useState({ X: "", O: "" });
  const [board, setBoard] = useState(Array(9).fill(null));
  const [current, setCurrent] = useState("X");
  const [scores, setScores] = useState({ X: 0, O: 0, D: 0 });
  const [shakingCell, setShakingCell] = useState(null);
  const [poppingCell, setPoppingCell] = useState(null);
  const [winnerCells, setWinnerCells] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const displayName = (p) => names[p] || `Player ${p}`;

  function checkWinner(b) {
    for (const [a, c, d] of WINS) {
      if (b[a] && b[a] === b[c] && b[a] === b[d]) return { player: b[a], cells: [a, c, d] };
    }
    return null;
  }

  function handleCellClick(i) {
    if (board[i] || gameOver) return;
    setShakingCell(i);
    setPoppingCell(i);
    setTimeout(() => setShakingCell(null), 400);
    setTimeout(() => setPoppingCell(null), 400);

    const newBoard = [...board];
    newBoard[i] = current;
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      setWinnerCells(result.cells);
      setGameOver(true);
      setScores(s => ({ ...s, [result.player]: s[result.player] + 1 }));
      setStatusMsg({ type: "win", player: result.player });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
    } else if (!newBoard.includes(null)) {
      setGameOver(true);
      setScores(s => ({ ...s, D: s.D + 1 }));
      setStatusMsg({ type: "draw" });
    } else {
      setCurrent(c => c === "X" ? "O" : "X");
    }
  }

  function resetGame() {
    setBoard(Array(9).fill(null));
    setCurrent("X");
    setWinnerCells([]);
    setGameOver(false);
    setStatusMsg(null);
    setShowConfetti(false);
  }

 function goToNames() {
    resetGame();
    setScores({ X: 0, O: 0, D: 0 });
    setNames({ X: "", O: "" });
    setPhase("names");
  }

  function renderStatus() {
    if (!statusMsg) {
      const p = current;
      const cls = p === "X" ? "name-x" : "name-o";
      return <><span className={`${cls} blink`}>{displayName(p)}</span> ki baari hai</>;
    }
    if (statusMsg.type === "win") {
      const p = statusMsg.player;
      const cls = p === "X" ? "name-x" : "name-o";
      return <><span className={cls}>{displayName(p)}</span> Jeet Gaya! 🎉</>;
    }
    return <>Draw Hua! 🤝</>;
  }

  return (
    <>
      <style>{styles}</style>
      <Confetti show={showConfetti} />
      <div className="ttt-root">
          <Stars />
        {phase === "names" && (
          <div className="name-screen">
            <div className="name-heading">
              <div className="name-title">TIC TAC TOE</div>
              <div className="name-subtitle">Enter Player Names</div>
            </div>
            <div className="name-cards">
              <div className="name-card x-card">
                <div className="name-card-label">Player 1</div>
                <div className="name-card-symbol">X</div>
                <input
                  className="name-input"
                  placeholder="Naam likho..."
                  value={names.X}
                  onChange={e => setNames(n => ({ ...n, X: e.target.value }))}
                  maxLength={14}
                />
              </div>
              <div className="name-card o-card">
                <div className="name-card-label">Player 2</div>
                <div className="name-card-symbol">O</div>
                <input
                  className="name-input"
                  placeholder="Naam likho..."
                  value={names.O}
                  onChange={e => setNames(n => ({ ...n, O: e.target.value }))}
                  maxLength={14}
                />
              </div>
            </div>
            <button
              className="start-btn"
              onClick={() => { resetGame(); setPhase("game"); }}
              disabled={!names.X.trim() || !names.O.trim()}
            >
              Game Shuru Karo
            </button>
          </div>
        )}

        {phase === "game" && (
          <div className="game-screen">
            <div className="game-title">TIC TAC TOE</div>
            <div className="score-row">
              <div className="score-card x-score">
                <div className="score-name">{displayName("X")} (X)</div>
                <div className="score-val">{scores.X}</div>
              </div>
              <div className="score-card d-score">
                <div className="score-name">Draw</div>
                <div className="score-val">{scores.D}</div>
              </div>
              <div className="score-card o-score">
                <div className="score-name">{displayName("O")} (O)</div>
                <div className="score-val">{scores.O}</div>
              </div>
            </div>
         <div className="status-box">{renderStatus()}</div>
            <div className="glass-board">
            <div className="board-grid" data-turn={current}>
                {board.map((val, i) => {
                  const isWinner = winnerCells.includes(i);
                  let cls = "cell";
                  if (val) cls += " filled";
                  if (val === "X") cls += " cell-x";
                  if (val === "O") cls += " cell-o";
                  if (isWinner) cls += " winner";
                  if (shakingCell === i && !val) cls += " shake";
                  if (poppingCell === i && val) cls += " pop";
                  if (gameOver && !isWinner) cls += " game-over";
                  return (
                    <div key={i} className={cls} onClick={() => handleCellClick(i)}>
                      {val}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="btn-row">
              <button className="action-btn btn-new" onClick={resetGame}>New Game</button>
              <button className="action-btn btn-change" onClick={goToNames}>Change Name</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
