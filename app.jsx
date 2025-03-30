import { Fragment, jsxDEV } from "react/jsx-dev-runtime";
const { useState, useEffect, useCallback, useSyncExternalStore } = React;
const { createRoot } = ReactDOM;
const room = new WebsimSocket();
const LEADERBOARD_COLLECTION = "hold_game_scores_v1";
function formatTime(milliseconds) {
  const seconds = (milliseconds / 1e3).toFixed(2);
  return `${seconds}s`;
}
function Avatar({ peer, presence }) {
  if (!presence || !presence.active || !presence.position) {
    return null;
  }
  const { x, y } = presence.position;
  const style = {
    top: `${y}px`,
    left: `${x}px`
  };
  return /* @__PURE__ */ jsxDEV("div", { className: "avatar-container", style, children: /* @__PURE__ */ jsxDEV(
    "img",
    {
      src: peer.avatarUrl,
      alt: peer.username,
      className: "avatar",
      draggable: "false"
    },
    void 0,
    false,
    {
      fileName: "<stdin>",
      lineNumber: 29,
      columnNumber: 13
    },
    this
  ) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 28,
    columnNumber: 9
  }, this);
}
function Leaderboard() {
  const scores = useSyncExternalStore(
    room.collection(LEADERBOARD_COLLECTION).subscribe,
    room.collection(LEADERBOARD_COLLECTION).getList
  );
  const topScores = scores.sort((a, b) => b.score - a.score).slice(0, 10);
  return /* @__PURE__ */ jsxDEV("div", { className: "leaderboard", children: [
    /* @__PURE__ */ jsxDEV("h2", { children: "Top 10 Scores" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 52,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("ol", { children: topScores.map((entry) => /* @__PURE__ */ jsxDEV("li", { children: [
      /* @__PURE__ */ jsxDEV("span", { className: "username", children: entry.username }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 56,
        columnNumber: 25
      }, this),
      /* @__PURE__ */ jsxDEV("span", { className: "score", children: formatTime(entry.score) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 57,
        columnNumber: 25
      }, this)
    ] }, entry.id, true, {
      fileName: "<stdin>",
      lineNumber: 55,
      columnNumber: 21
    }, this)) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 53,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 51,
    columnNumber: 9
  }, this);
}
function App() {
  const [isHolding, setIsHolding] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const presence = useSyncExternalStore(
    room.subscribePresence,
    () => room.presence
  );
  const peers = useSyncExternalStore(
    room.subscribePresence,
    // Re-use presence subscription for peers
    () => room.peers
  );
  useEffect(() => {
    room.initialize();
  }, []);
  useEffect(() => {
    if (isHolding) {
      const id = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 50);
      setIntervalId(id);
    } else {
      clearInterval(intervalId);
      setIntervalId(null);
      if (startTime) {
        const score = Date.now() - startTime;
        setFinalScore(score);
        setGameOver(true);
        room.collection(LEADERBOARD_COLLECTION).create({ score });
        setStartTime(null);
        setElapsedTime(0);
      }
    }
    return () => clearInterval(intervalId);
  }, [isHolding, startTime]);
  const handleInteractionStart = useCallback((e) => {
    e.preventDefault();
    if (gameOver) return;
    const position = getEventPosition(e);
    setIsHolding(true);
    setStartTime(Date.now());
    setElapsedTime(0);
    room.updatePresence({ active: true, position });
  }, [gameOver]);
  const handleInteractionEnd = useCallback((e) => {
    e.preventDefault();
    if (!isHolding) return;
    setIsHolding(false);
    room.updatePresence({ active: false });
  }, [isHolding]);
  const handleInteractionMove = useCallback((e) => {
    if (!isHolding || gameOver) return;
    e.preventDefault();
    const position = getEventPosition(e);
    room.updatePresence({ position });
  }, [isHolding, gameOver]);
  const getEventPosition = (e) => {
    let x, y;
    if (e.touches && e.touches.length > 0) {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      x = e.changedTouches[0].clientX;
      y = e.changedTouches[0].clientY;
    } else {
      x = e.clientX;
      y = e.clientY;
    }
    return { x, y };
  };
  const restartGame = () => {
    setGameOver(false);
    setFinalScore(0);
    setElapsedTime(0);
    setStartTime(null);
    setIsHolding(false);
    room.updatePresence({ active: false, position: null });
  };
  const ownPresence = room.clientId ? presence[room.clientId] : null;
  const ownPeer = room.clientId ? peers[room.clientId] : null;
  return /* @__PURE__ */ jsxDEV(Fragment, { children: [
    /* @__PURE__ */ jsxDEV(
      "div",
      {
        className: "game-area",
        onMouseDown: handleInteractionStart,
        onMouseUp: handleInteractionEnd,
        onMouseLeave: handleInteractionEnd,
        onMouseMove: handleInteractionMove,
        onTouchStart: handleInteractionStart,
        onTouchEnd: handleInteractionEnd,
        onTouchCancel: handleInteractionEnd,
        onTouchMove: handleInteractionMove,
        children: [
          Object.entries(peers).map(([clientId, peer]) => {
            const clientPresence = presence[clientId];
            if (!peer || !clientPresence) return null;
            return /* @__PURE__ */ jsxDEV(Avatar, { peer, presence: clientPresence }, clientId, false, {
              fileName: "<stdin>",
              lineNumber: 192,
              columnNumber: 29
            }, this);
          }),
          isHolding && ownPresence && ownPresence.position && /* @__PURE__ */ jsxDEV("div", { className: "timer", style: { top: `${ownPresence.position.y + 30}px`, left: `${ownPresence.position.x}px` }, children: formatTime(elapsedTime) }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 196,
            columnNumber: 22
          }, this),
          gameOver && /* @__PURE__ */ jsxDEV("div", { className: "game-over-message", children: [
            "Game Over! ",
            /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 203,
              columnNumber: 36
            }, this),
            "Your Score: ",
            formatTime(finalScore),
            /* @__PURE__ */ jsxDEV("button", { onClick: restartGame, style: { marginTop: "10px", padding: "10px 20px", fontSize: "1em" }, children: "Play Again" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 205,
              columnNumber: 25
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 202,
            columnNumber: 21
          }, this)
        ]
      },
      void 0,
      true,
      {
        fileName: "<stdin>",
        lineNumber: 177,
        columnNumber: 13
      },
      this
    ),
    !gameOver && /* @__PURE__ */ jsxDEV(Leaderboard, {}, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 209,
      columnNumber: 27
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 176,
    columnNumber: 9
  }, this);
}
const container = document.getElementById("root");
const root = createRoot(container);
root.render(/* @__PURE__ */ jsxDEV(App, {}, void 0, false, {
  fileName: "<stdin>",
  lineNumber: 216,
  columnNumber: 13
}));
