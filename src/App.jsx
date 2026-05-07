import { useState, useEffect, useRef, useMemo } from "react";
import EmojiPicker from "emoji-picker-react";
import { io } from "socket.io-client";



const WINS = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700&family=Rajdhani:wght@400;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .ttt-root { min-height: 100vh; width: 100%; display: flex; align-items: center; justify-content: center; background: radial-gradient(ellipse at 20% 50%, #1a0533 0%, #0a0a1a 50%, #001233 100%); font-family: 'Rajdhani', sans-serif; padding: 2rem 1rem; position: relative; overflow: hidden; }
  .star { position: fixed; border-radius: 50%; background: white; pointer-events: none; z-index: 0; }
  .name-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 28px; width: 100%; max-width: 500px; }
  .name-heading { display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .name-title { font-family: 'Orbitron', monospace; font-size: 28px; color: #fff; text-align: center; text-shadow: 0 0 30px #a78bfa, 0 0 60px #7c3aed; letter-spacing: 4px; }
  .name-subtitle { font-size: 13px; color: rgba(255,255,255,0.4); letter-spacing: 2px; text-transform: uppercase; }
  .name-cards { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; width: 100%; }
  .name-card { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 18px; padding: 24px 28px; display: flex; flex-direction: column; align-items: center; gap: 14px; flex: 1; min-width: 160px; max-width: 200px; transition: all 0.3s; }
  .name-card:focus-within { border-color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.12); transform: translateY(-4px); box-shadow: 0 8px 30px rgba(0,0,0,0.3); }
  .name-card.x-card:focus-within { border-color: rgba(96,165,250,0.7); box-shadow: 0 0 25px rgba(59,130,246,0.3); }
  .name-card.o-card:focus-within { border-color: rgba(244,114,182,0.7); box-shadow: 0 0 25px rgba(236,72,153,0.3); }
  .name-card-label { font-size: 12px; letter-spacing: 3px; text-transform: uppercase; }
  .name-card.x-card .name-card-label { color: #60a5fa; }
  .name-card.o-card .name-card-label { color: #f472b6; }
  .name-card-symbol { font-family: 'Orbitron', monospace; font-size: 44px; font-weight: 700; line-height: 1; }
  .name-card.x-card .name-card-symbol { color: #60a5fa; text-shadow: 0 0 20px #3b82f6, 0 0 40px #1d4ed8; }
  .name-card.o-card .name-card-symbol { color: #f472b6; text-shadow: 0 0 20px #ec4899, 0 0 40px #be185d; }
  .name-input { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); border-radius: 10px; color: #fff; font-size: 15px; font-family: 'Rajdhani', sans-serif; font-weight: 600; padding: 8px 12px; width: 100%; text-align: center; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
  .name-input:not(:placeholder-shown) { border-color: rgba(255,255,255,0.4); box-shadow: 0 0 12px rgba(255,255,255,0.1); }
  .name-card.x-card .name-input:focus { border-color: #60a5fa; box-shadow: 0 0 14px rgba(96,165,250,0.3); }
  .name-card.o-card .name-input:focus { border-color: #f472b6; box-shadow: 0 0 14px rgba(244,114,182,0.3); }
  .name-input::placeholder { color: rgba(255,255,255,0.25); }
  .start-btn { padding: 14px 48px; background: linear-gradient(135deg, rgba(124,58,237,0.4), rgba(236,72,153,0.3)); border: 1px solid rgba(167,139,250,0.5); border-radius: 12px; color: #e9d5ff; font-family: 'Orbitron', monospace; font-size: 12px; letter-spacing: 3px; cursor: pointer; transition: all 0.25s; text-transform: uppercase; }
  .start-btn:hover { background: linear-gradient(135deg, rgba(124,58,237,0.7), rgba(236,72,153,0.5)); box-shadow: 0 0 30px rgba(167,139,250,0.4); color: #fff; }
  .start-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .game-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; width: 100%; max-width: 420px; }
  .game-title { font-family: 'Orbitron', monospace; font-size: 22px; color: #fff; letter-spacing: 4px; text-shadow: 0 0 20px #a78bfa, 0 0 40px #7c3aed; }
  .score-row { display: flex; gap: 12px; width: 100%; justify-content: center; }
  .score-card { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 10px 16px; text-align: center; flex: 1; max-width: 120px; }
  .score-name { font-size: 11px; letter-spacing: 1px; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .score-card.x-score .score-name { color: #93c5fd; }
  .score-card.o-score .score-name { color: #f9a8d4; }
  .score-card.d-score .score-name { color: rgba(255,255,255,0.4); }
  .score-val { font-family: 'Orbitron', monospace; font-size: 26px; font-weight: 700; margin-top: 4px; }
  .score-card.x-score .score-val { color: #60a5fa; text-shadow: 0 0 10px #3b82f6; }
  .score-card.o-score .score-val { color: #f472b6; text-shadow: 0 0 10px #ec4899; }
  .score-card.d-score .score-val { color: #9ca3af; }
  .score-card.active-turn { border-color: rgba(255,255,255,0.4); transform: scale(1.06); transition: all 0.3s; }
  .score-card.x-score.active-turn { border-color: rgba(96,165,250,0.7); box-shadow: 0 0 20px rgba(59,130,246,0.3); }
  .score-card.o-score.active-turn { border-color: rgba(244,114,182,0.7); box-shadow: 0 0 20px rgba(236,72,153,0.3); }
  .status-box { font-size: 17px; font-weight: 600; letter-spacing: 1px; color: rgba(255,255,255,0.8); min-height: 28px; display: flex; align-items: center; gap: 6px; }
  .blink { animation: blinkAnim 1.2s ease infinite; }
  @keyframes blinkAnim { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  .status-box .name-x { color: #60a5fa; text-shadow: 0 0 8px #3b82f6; }
  .status-box .name-o { color: #f472b6; text-shadow: 0 0 8px #ec4899; }
  .glass-board { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 22px; padding: 16px; box-shadow: 0 8px 40px rgba(0,0,0,0.5); }
  .board-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .cell { width: 90px; height: 90px; border-radius: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-family: 'Orbitron', monospace; font-size: 36px; font-weight: 700; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); transition: background 0.2s, transform 0.15s; user-select: none; }
  .cell.filled { cursor: default; }
  .cell.cell-x { background: linear-gradient(135deg, rgba(37,99,235,0.25), rgba(96,165,250,0.12)); border-color: rgba(96,165,250,0.5); color: #60a5fa; text-shadow: 0 0 18px #3b82f6, 0 0 35px #1d4ed8; box-shadow: 0 0 20px rgba(59,130,246,0.2), inset 0 0 20px rgba(59,130,246,0.08); }
  .cell.cell-o { background: linear-gradient(135deg, rgba(190,24,93,0.25), rgba(244,114,182,0.12)); border-color: rgba(244,114,182,0.5); color: #f472b6; text-shadow: 0 0 18px #ec4899, 0 0 35px #be185d; box-shadow: 0 0 20px rgba(236,72,153,0.2), inset 0 0 20px rgba(236,72,153,0.08); }
  .cell.pop { animation: popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards; }
  .cell.winner { animation: winGlow 0.7s ease infinite alternate; }
  .cell.winner.cell-x { box-shadow: 0 0 30px rgba(59,130,246,0.7), 0 0 60px rgba(59,130,246,0.3); border-color: #60a5fa; }
  .cell.winner.cell-o { box-shadow: 0 0 30px rgba(236,72,153,0.7), 0 0 60px rgba(236,72,153,0.3); border-color: #f472b6; }
  .board-grid[data-turn="X"] .cell:hover:not(.filled):not(.game-over) { background: rgba(59,130,246,0.15); border-color: rgba(96,165,250,0.4); transform: scale(1.05); }
  .board-grid[data-turn="O"] .cell:hover:not(.filled):not(.game-over) { background: rgba(236,72,153,0.15); border-color: rgba(244,114,182,0.4); transform: scale(1.05); }
  @keyframes popIn { 0% { transform: scale(0) rotate(-15deg); opacity: 0; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
  @keyframes winGlow { 0% { transform: scale(1); filter: brightness(1); } 100% { transform: scale(1.08); filter: brightness(1.3); } }
  .btn-row { display: flex; gap: 12px; }
  .action-btn { padding: 10px 28px; border-radius: 10px; font-family: 'Orbitron', monospace; font-size: 10px; letter-spacing: 2px; cursor: pointer; transition: all 0.2s; }
  .btn-new { background: rgba(167,139,250,0.15); border: 1px solid rgba(167,139,250,0.45); color: #c4b5fd; }
  .btn-new:hover { background: rgba(167,139,250,0.3); color: #fff; }
  .btn-change { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.45); }
  .btn-change:hover { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); }
  .confetti-wrap { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 999; overflow: hidden; }
  .confetti-piece { position: absolute; top: -20px; border-radius: 2px; animation: confettiFall linear forwards; }
  @keyframes confettiFall { to { transform: translateY(110vh) rotate(720deg); opacity: 0; } }
  .waiting-msg { color: rgba(255,255,255,0.5); font-size: 14px; letter-spacing: 2px; text-align: center; }
  .validation-msg { margin-top:10px; padding:8px 14px; border-radius:10px; font-size:12px; letter-spacing:1px; font-weight:600; text-align:center; animation: popMsg .25s ease; min-width:220px; }
  .validation-msg.error { color:#fecaca; background:rgba(239,68,68,.12); border:1px solid rgba(239,68,68,.45); box-shadow:0 0 18px rgba(239,68,68,.18); }
  .validation-msg.success { color:#bbf7d0; background:rgba(34,197,94,.12); border:1px solid rgba(34,197,94,.45); box-shadow:0 0 18px rgba(34,197,94,.18); }
  @keyframes popMsg { 0%{opacity:0;transform:translateY(8px) scale(.95);} 100%{opacity:1;transform:translateY(0) scale(1);} }
  .win-popup { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0); font-family: 'Orbitron', monospace; font-size: 180px; font-weight: 700; z-index: 1000; pointer-events: none; animation: winPopup 1.2s cubic-bezier(0.34,1.56,0.64,1) forwards; }
  .win-popup.x { color: #60a5fa; text-shadow: 0 0 80px #3b82f6, 0 0 150px #1d4ed8; }
  .win-popup.o { color: #f472b6; text-shadow: 0 0 80px #ec4899, 0 0 150px #be185d; }
  @keyframes winPopup { 0% { transform: translate(-50%, -50%) scale(0); opacity: 0; } 60% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; } 80% { transform: translate(-50%, -50%) scale(0.95); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(0); opacity: 0; } }

  /* ===== CHAT ===== */
  .chat-bubble-btn { position: fixed; bottom: 24px; right: 24px; width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, rgba(124,58,237,0.8), rgba(236,72,153,0.6)); border: 1px solid rgba(167,139,250,0.6); color: #fff; font-size: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(124,58,237,0.4); z-index: 600; transition: transform 0.2s; }
  .chat-bubble-btn:hover { transform: scale(1.1); }
  .chat-unread { position: absolute; top: -4px; right: -4px; background: #f472b6; color: #fff; font-size: 10px; font-weight: 700; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
  .chat-panel { position: fixed; bottom: 88px; right: 24px; width: 300px; background: rgba(15,10,30,0.97); border: 1px solid rgba(167,139,250,0.3); overflow: visible; padding: 12px; display: flex; flex-direction: column; gap: 8px; z-index: 600; box-shadow: 0 8px 32px rgba(0,0,0,0.6);transform: scale(0.8);
  opacity: 0;
  transform-origin: bottom right;
  pointer-events: none;

  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.2s ease; }
  .chat-panel-title { font-family: 'Orbitron', monospace; font-size: 11px; letter-spacing: 2px; color: rgba(255,255,255,0.5); text-align: center; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.08); }
   .chat-panel.open {transform: scale(1); opacity: 1; pointer-events: auto;}
   .chat-messages { height: 180px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; padding-right: 4px; }
  .chat-msg-mine { align-self: flex-end; background: rgba(124,58,237,0.25); border: 1px solid rgba(167,139,250,0.3); border-radius: 12px 12px 2px 12px; padding: 6px 10px; font-size: 13px; color: #e9d5ff; max-width: 85%; word-break: break-word; }
  .chat-msg-other { align-self: flex-start; background: rgba(59,130,246,0.2); border: 1px solid rgba(96,165,250,0.3); border-radius: 12px 12px 12px 2px; padding: 6px 10px; font-size: 13px; color: #bfdbfe; max-width: 85%; word-break: break-word; }
  .chat-msg-name { font-size: 10px; opacity: 0.6; margin-bottom: 2px; letter-spacing: 1px; }
  .chat-empty { color: rgba(255,255,255,0.3); font-size: 12px; text-align: center; margin-top: 60px; }
  .chat-input-row { display: flex; gap: 6px; }
  .chat-send-btn { background: rgba(167,139,250,0.3); border: 1px solid rgba(167,139,250,0.5); color: #fff; padding: 8px 12px; border-radius: 10px; cursor: pointer; font-size: 14px; }
  .chat-send-btn:hover { background: rgba(167,139,250,0.5); }
  .typing-indicator { font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 1px; min-height: 16px; }
  .emoji-row { display: flex; gap: 6px; flex-wrap: wrap; }
  .emoji-picker-wrapper {
  position: absolute;
  bottom: 65px;
  right: 0;
  z-index: 9999;

  animation: emojiOpen 0.18s ease;
}

@keyframes emojiOpen {
  from {
    opacity: 0;
    transform: translateY(10px) scale(.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
  @media (max-width: 420px) {
    .cell { width: 80px; height: 80px; font-size: 30px; }
    .name-cards { flex-direction: column; align-items: center; }
    .name-card { max-width: 260px; width: 100%; }
    .chat-panel { width: calc(100vw - 32px); right: 16px; }
  }
`;

const starData = Array.from({ length: 150 }, (_, i) => ({
  id: i,
  top: Math.random() * 100,
  left: Math.random() * 100,
  size: Math.random() * 2 + 0.5,
  opacity: Math.random() * 0.7 + 0.3,
}));

function Stars() {
  return (
    <>
      {starData.map(s => (
        <div key={s.id} className="star" style={{
          top: `${s.top}%`, left: `${s.left}%`,
          width: s.size, height: s.size, opacity: s.opacity,
        }} />
      ))}
    </>
  );
}

function Confetti({ show }) {
  const pieces = useMemo(() => {
    if (!show) return [];
    return Array.from({ length: 70 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 8 + 5,
      duration: Math.random() * 1.5 + 1.5,
      delay: Math.random() * 1.2,
      color: ["#60a5fa","#f472b6","#a78bfa","#facc15","#34d399","#fb923c"][Math.floor(Math.random()*6)],
    }));
  }, [show]);
  if (!show || pieces.length === 0) return null;
  return (
    <div className="confetti-wrap">
      {pieces.map(p => (
        <div key={p.id} className="confetti-piece" style={{
          left: `${p.left}%`, width: p.size, height: p.size,
          background: p.color,
          animationDuration: `${p.duration}s`,
          animationDelay: `${p.delay}s`,
        }} />
      ))}
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState(null);
  const socketRef = useRef(null);
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [phase, setPhase] = useState(null);
  const [names, setNames] = useState({ X: "", O: "" });
  const [board, setBoard] = useState(Array(9).fill(null));
  const [current, setCurrent] = useState("X");
  const [scores, setScores] = useState({ X: 0, O: 0, D: 0 });
  const [poppingCell, setPoppingCell] = useState(null);
  const [winnerCells, setWinnerCells] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [winSymbol, setWinSymbol] = useState(null);
  const [myRole, setMyRole] = useState(null);
  const [playerCount, setPlayerCount] = useState(0);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("error");
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingUser, setTypingUser] = useState("");
  const [socketId, setSocketId] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const showChatRef = useRef(false);
  const [showEmoji, setShowEmoji] = useState(false);

  // showChat ka ref track karo taaki listener me latest value mile
  useEffect(() => { showChatRef.current = showChat; }, [showChat]);

  function showMsg(text, type = "error") {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(""), 2200);
  }

  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on("connect", () => {
      setSocketId(socketRef.current.id);
    });

    socketRef.current.on("updateGame", (data) => {
      setBoard(data.board);
      setCurrent(data.current);
      setGameOver(data.gameOver);
      setWinnerCells(data.winnerCells || []);
      setScores(data.scores || { X: 0, O: 0, D: 0 });
      setPlayerCount(data.players?.length || 0);
      if (data.names) setNames(data.names);

      if (data.gameOver && data.winnerCells?.length > 0) {
        const winner = data.board[data.winnerCells[0]];
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3500);
        setWinSymbol(winner);
        setTimeout(() => setWinSymbol(null), 1200);
      }
    });

    socketRef.current.on("chatMessage", (data) => {
      setMessages(prev => {
        if (prev.some(m => m.time === data.time && m.senderId === data.senderId)) return prev;
        return [...prev, data];
      });
      if (!showChatRef.current) {
        setUnreadCount(prev => prev + 1);
      }
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    socketRef.current.on("typing", (data) => {
      setTypingUser(data?.name || "");
      setTimeout(() => setTypingUser(""), 1500);
    });

    return () => socketRef.current.disconnect();
  }, []);

  const displayName = (p) => names[p] || `Player ${p}`;

  function checkWinner(b) {
    for (let combo of WINS) {
      const [a, bIdx, c] = combo;
      if (b[a] && b[a] === b[bIdx] && b[a] === b[c]) {
        return { player: b[a], cells: combo };
      }
    }
    return null;
  }

  function sendMessage() {
    if (!chatInput.trim()) return;
    const msgData = {
      roomId,
      name: names[myRole] || myRole,
      msg: chatInput,
      time: Date.now(),
      senderId: socketRef.current.id,
    };
    
    socketRef.current.emit("chatMessage", msgData);
    setChatInput("");
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  function handleCellClick(i) {
    if (board[i] || gameOver) return;
    if (mode === "online") {
      if (!joined || myRole !== current) return;
      socketRef.current.emit("move", { roomId, index: i });
    } else {
      const newBoard = [...board];
      newBoard[i] = current;
      setPoppingCell(i);
      setTimeout(() => setPoppingCell(null), 400);
      const result = checkWinner(newBoard);
      if (result) {
        setWinnerCells(result.cells);
        setScores(s => ({ ...s, [result.player]: s[result.player] + 1 }));
        setGameOver(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3500);
        setWinSymbol(result.player);
        setTimeout(() => setWinSymbol(null), 1200);
      } else if (!newBoard.includes(null)) {
        setScores(s => ({ ...s, D: s.D + 1 }));
        setGameOver(true);
      } else {
        setCurrent(c => c === "X" ? "O" : "X");
      }
      setBoard(newBoard);
    }
  }

  function resetGame() {
    setBoard(Array(9).fill(null));
    setCurrent("X");
    setWinnerCells([]);
    setGameOver(false);
    setShowConfetti(false);
    setWinSymbol(null);
    if (mode === "online") socketRef.current.emit("resetGame", { roomId });
  }

  function goToNames() {
    setGameOver(false);
    setBoard(Array(9).fill(null));
    setScores({ X: 0, O: 0, D: 0 });
    setNames({ X: "", O: "" });
    setWinnerCells([]);
    setShowConfetti(false);
    setWinSymbol(null);
    setJoined(false);
    setMyRole(null);
    setRoomId("");
    setPhase("names");
    setMode(null);
    setMessages([]);
    setChatInput("");
    setShowChat(false);
    setUnreadCount(0);
  }

  function renderStatus() {
    if (playerCount < 2) return <span className="waiting-msg">Waiting for opponent...</span>;
    if (gameOver) {
      if (winnerCells.length > 0) {
        const winner = board[winnerCells[0]];
        const cls = winner === "X" ? "name-x" : "name-o";
        return <><span className={cls}>{displayName(winner)}</span> Wins! 🎉</>;
      }
      return <>Draw! 🤝</>;
    }
    const cls = current === "X" ? "name-x" : "name-o";
    return <><span className={`${cls} blink`}>{displayName(current)}</span>'s turn</>;
  }

  return (
    <>
      <style>{styles}</style>
      <Confetti show={showConfetti} />
      {winSymbol && <div className={`win-popup ${winSymbol.toLowerCase()}`}>{winSymbol}</div>}

      <div className="ttt-root">
        <Stars />

        {/* Mode Selection */}
        {!mode && (
          <div className="name-screen">
            <div className="name-heading">
              <div className="name-title">TIC TAC TOE</div>
              <div className="name-subtitle">Choose Mode</div>
            </div>
            <div className="name-cards" style={{justifyContent:"center"}}>
              <div className="name-card x-card" style={{cursor:"pointer", maxWidth:180}}
                onClick={() => { setMode("offline"); setPhase("names"); }}>
                <div className="name-card-symbol" style={{fontSize:32}}>👥</div>
                <div className="name-card-label">Offline</div>
                <div style={{color:"rgba(255,255,255,0.4)", fontSize:12, textAlign:"center"}}>Same device pe khelo</div>
              </div>
              <div className="name-card o-card" style={{cursor:"pointer", maxWidth:180}}
                onClick={() => { setMode("online"); setPhase("names"); }}>
                <div className="name-card-symbol" style={{fontSize:32}}>🌐</div>
                <div className="name-card-label">Online</div>
                <div style={{color:"rgba(255,255,255,0.4)", fontSize:12, textAlign:"center"}}>Dusre device se khelo</div>
              </div>
            </div>
          </div>
        )}

        {/* Name Entry */}
        {mode && phase === "names" && (
          <div className="name-screen">
            <button onClick={() => { setMode(null); setPhase(null); setRoomId(""); setNames({ X: "", O: "" }); setMsg(""); }}
              style={{ position:"absolute", top:"20px", left:"20px", background:"rgba(255,255,255,0.08)",
                border:"1px solid rgba(255,255,255,0.15)", color:"#fff", padding:"8px 14px",
                borderRadius:"10px", cursor:"pointer", fontSize:"13px", backdropFilter:"blur(10px)" }}>
              ← Back
            </button>
            <div className="name-heading">
              <div className="name-title">TIC TAC TOE</div>
              <div className="name-subtitle">Enter Player Names</div>
            </div>
            <div className="name-cards">
              {mode === "offline" ? (
                <>
                  <div className="name-card x-card">
                    <div className="name-card-label">Player 1</div>
                    <div className="name-card-symbol">X</div>
                    <input className="name-input" placeholder="Your name"
                      value={names.X} onChange={e => setNames(n => ({ ...n, X: e.target.value }))} maxLength={14} />
                  </div>
                  <div className="name-card o-card">
                    <div className="name-card-label">Player 2</div>
                    <div className="name-card-symbol">O</div>
                    <input className="name-input" placeholder="Opponent name"
                      value={names.O} onChange={e => setNames(n => ({ ...n, O: e.target.value }))} maxLength={14} />
                  </div>
                </>
              ) : (
                <div className="name-card x-card">
                  <div className="name-card-label">Your Name</div>
                  <div className="name-card-symbol">?</div>
                  <input className="name-input" placeholder="Enter your name"
                    value={names.X} onChange={e => setNames(n => ({ ...n, X: e.target.value }))} maxLength={14} />
                </div>
              )}
            </div>
            {mode === "online" && (
              <>
                <div style={{ color:"rgba(255,255,255,0.6)", fontSize:12, letterSpacing:1 }}>Enter or create Room ID</div>
                <input className="name-input" style={{ maxWidth: 260 }}
                  placeholder="e.g. room123" value={roomId} onChange={e => setRoomId(e.target.value)} />
              </>
            )}
            {mode === "offline" ? (
              <>
                <button className="start-btn" onClick={() => {
                  if (!names.X.trim() || !names.O.trim()) { showMsg("Enter both player names"); return; }
                  showMsg("Starting offline match...", "success");
                  setTimeout(() => { setPhase("game"); setPlayerCount(2); }, 500);
                }}>Start Offline Game</button>
                {msg && <div className={`validation-msg ${msgType}`}>{msg}</div>}
              </>
            ) : (
              <>
                <button className="start-btn" onClick={() => {
                  if (!names.X.trim()) { showMsg("Enter your name"); return; }
                  if (!roomId.trim()) { showMsg("Enter room ID"); return; }
                  showMsg("Joining room...", "success");
                  socketRef.current.emit("joinRoom", { roomId, name: names.X }, (res) => {
                    if (res.role) {
                      setMyRole(res.role);
                      setNames(n => ({ ...n, [res.role]: names.X }));
                      setJoined(true);
                      setPhase("game");
                    } else {
                      showMsg(res.msg || "Could not join room");
                    }
                  });
                }}>Join Online Game</button>
                {msg && <div className={`validation-msg ${msgType}`}>{msg}</div>}
              </>
            )}
          </div>
        )}

        {/* Game Screen */}
        {phase === "game" && (
          <div className="game-screen">
            <div className="game-title">TIC TAC TOE</div>
            {myRole && (
              <div style={{ color: myRole === "X" ? "#60a5fa" : "#f472b6", fontSize: 13, letterSpacing: 2 }}>
                You are <strong>{myRole}</strong>
              </div>
            )}
            <div className="score-row">
              <div className={`score-card x-score${!gameOver && current === "X" && playerCount === 2 ? " active-turn" : ""}`}>
                <div className="score-name">{displayName("X")} (X)</div>
                <div className="score-val">{scores.X}</div>
              </div>
              <div className="score-card d-score">
                <div className="score-name">Draw</div>
                <div className="score-val">{scores.D}</div>
              </div>
              <div className={`score-card o-score${!gameOver && current === "O" && playerCount === 2 ? " active-turn" : ""}`}>
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
                  if (poppingCell === i && val) cls += " pop";
                  if (gameOver && !isWinner) cls += " game-over";
                  return <div key={i} className={cls} onClick={() => handleCellClick(i)}>{val}</div>;
                })}
              </div>
            </div>
            <div className="btn-row">
              <button className="action-btn btn-new" onClick={resetGame}>New Game</button>
              <button className="action-btn btn-change" onClick={goToNames}>Leave Room</button>
            </div>
          </div>
        )}
      </div>

      {/* ===== CHAT — Fixed Bottom Right, sirf online game me ===== */}
      {mode === "online" && phase === "game" && (
        <>
          {/* Chat Panel */}
          
           <div className={`chat-panel ${showChat ? "open" : ""}`}>
              <div className="chat-panel-title">💬 CHAT</div>

              <div className="chat-messages">
                {messages.length === 0 && <div className="chat-empty">Koi message nahi abhi...</div>}
                {messages.map((m, i) => (
                  <div key={i} className={m.senderId === socketId ? "chat-msg-mine" : "chat-msg-other"}>
                    <div className="chat-msg-name">{m.name}</div>
                    <div>{m.msg}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Typing indicator */}
              <div className="typing-indicator">
                {typingUser ? `${typingUser} is typing...` : ""}
              </div>

              {/* Quick Emojis */}
              <div className="emoji-row">
                {["😂","🔥","👏","😤","💀","🎉","😎","🙏","❤️","💪"].map(e => (
                  <span key={e} style={{ cursor:"pointer", fontSize:20 }}
                    onClick={() => setChatInput(prev => prev + e)}>
                    {e}
                  </span>
                ))}
              </div>
            <div style={{ position: "relative" }}>

  {showEmoji && (
    <div
      style={{
        position: "absolute",
        bottom: "60px",
        right: "0",
        zIndex: 9999
      }}
    >
      <EmojiPicker
        onEmojiClick={(emojiData) => {
          setChatInput(prev => prev + emojiData.emoji);
        }}
        theme="dark"
      />
    </div>
  )}

  {/* Input Row */}
  <div className="chat-input-row">

    <input
      className="name-input"
      placeholder="Message..."
      value={chatInput}
      onChange={e => {
        setChatInput(e.target.value);

        socketRef.current.emit("typing", {
          roomId,
          name: names[myRole] || myRole
        });
      }}
      onKeyDown={e => e.key === "Enter" && sendMessage()}
      style={{ flex:1, textAlign:"left" }}
    />

    <button
      className="chat-send-btn"
      onClick={() => setShowEmoji(prev => !prev)}
    >
      😀
    </button>

    <button
      className="chat-send-btn"
      onClick={sendMessage}
    >
      ➤
    </button>

  </div>
</div>
              {/* Input Row */}
            
            </div>
          

          {/* Floating Button */}
          <button className="chat-bubble-btn" onClick={() => {
            setShowChat(s => !s);
            setUnreadCount(0);
          }}>
            {showChat ? "✕" : "💬"}
            {!showChat && unreadCount > 0 && (
              <div className="chat-unread">{unreadCount}</div>
            )}
          </button>
        </>
      )}
    </>
  );
}