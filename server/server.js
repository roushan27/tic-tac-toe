const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const rooms = {};

const WINS = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function checkWinner(board) {
  for (let [a, b, c] of WINS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], cells: [a, b, c] };
    }
  }
  return null;
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", ({ roomId, name }, callback) => {
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.name = name;
  });

 socket.on("typing", ({ name }) => {
  const roomId = socket.data.roomId;
  if (!roomId) return;

  socket.to(roomId).emit("typing", { name });
});
  socket.on("joinRoom", ({ roomId, name }, callback) => {
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.name = name;

    if (!rooms[roomId]) {
      rooms[roomId] = {
        board: Array(9).fill(null),
        current: "X",
        players: [],
        names: {},
        scores: { X: 0, O: 0, D: 0 },
        gameOver: false,
        winnerCells: [],
      };
    }

    const room = rooms[roomId];

    const existing = room.players.find((p) => p.id === socket.id);
    if (existing) {
      callback({ role: existing.role });
      io.to(roomId).emit("updateGame", room);
      return;
    }

    if (room.players.length >= 2) {
      callback({ role: null, msg: "Room Full" });
      return;
    }

    const role = room.players.length === 0 ? "X" : "O";
    room.players.push({ id: socket.id, role, name });
    room.names[role] = name || `Player ${role}`;

    callback({ role });
    io.to(roomId).emit("updateGame", room);
  });

  socket.on("move", ({ roomId, index }) => {
    const room = rooms[roomId];
    if (!room || room.gameOver) return;
    if (room.board[index]) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player || player.role !== room.current) return;

    room.board[index] = room.current;

    const result = checkWinner(room.board);
    if (result) {
      room.scores[result.winner]++;
      room.winnerCells = result.cells;
      room.gameOver = true;
    } else if (!room.board.includes(null)) {
      room.scores.D++;
      room.gameOver = true;
      room.winnerCells = [];
    } else {
      room.current = room.current === "X" ? "O" : "X";
      room.winnerCells = [];
    }

    io.to(roomId).emit("updateGame", room);
  });

  socket.on("resetGame", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;

    room.board = Array(9).fill(null);
    room.current = "X";
    room.gameOver = false;
    room.winnerCells = [];

    io.to(roomId).emit("updateGame", room);
  });

  socket.on("chatMessage", (data) => {
  io.in(data.roomId).emit("chatMessage", {
    ...data,
    time: Date.now(),
    senderId: socket.id
  });
});

socket.on("typing", ({ roomId, name }) => {
  socket.to(roomId).emit("typing", { name });
});
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (const roomId in rooms) {
      const room = rooms[roomId];
      room.players = room.players.filter((p) => p.id !== socket.id);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});