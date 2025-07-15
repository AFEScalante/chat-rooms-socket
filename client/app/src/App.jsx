import { useState } from "react";
import { motion } from "motion/react"; //eslint-disable-line
import "./App.css";
import { socket } from "./socket";
import { useEffect } from "react";
import { useRef } from "react";
import { ConnectionMgr } from "./components/ConnectionMgr";

function App() {
  const msgEndRef = useRef(null);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [chatMsg, setChatMsg] = useState([]);
  const [msg, setMsg] = useState("");
  const [chatRoom, setChatRoom] = useState("");
  const [userName, setUserName] = useState("");
  const [chatRoomActive, setChatRoomActive] = useState(false);

  const scrollToEnd = () => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onMessageEvent({ user, message }) {
      const value = `${user}: ${message}`;
      setChatMsg((previous) => [...previous, value]);
      scrollToEnd();
    }

    function onJoinRoom() {
      setChatRoomActive(true);
    }

    function onLeaveRoom() {
      setChatRoomActive(false);
      setChatMsg([]);
      setMsg("");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message", onMessageEvent);
    socket.on("room-joined", onJoinRoom);
    socket.on("room-leave", onLeaveRoom);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message", onMessageEvent);
      socket.off("room-joined", onJoinRoom);
      socket.off("room-leave", onLeaveRoom);
    };
  }, []);

  function onSubmitMessage(e) {
    e.preventDefault();
    socket.emit("message", { roomId: chatRoom, user: userName, message: msg });
    const value = `tú: ${msg}`;
    setChatMsg((prev) => [...prev, value]);
    scrollToEnd();
    setMsg("");
  }

  function onEnterRoom(e) {
    e.preventDefault();
    if (chatRoom !== "" && userName !== "") {
      const roomId = `room-${chatRoom}`;
      socket.emit("join-room", roomId);
      setChatRoom(roomId);
    }
  }

  if (!isConnected)
    return (
      <main className="app">
        Connecting to the chat server...
        <ConnectionMgr socket={socket} />
      </main>
    );

  if (!chatRoomActive || chatRoom === "")
    return (
      <main className="app">
        <section className="chat-room">
          <form onSubmit={onEnterRoom}>
            <label htmlFor="room">
              Ingresa el número del chat room:{" "}
              <input
                id="room"
                type="number"
                placeholder="1"
                min="1"
                max="100"
                required
                value={chatRoom}
                onChange={(e) => setChatRoom(e.target.value)}
              />
            </label>{" "}
            <label htmlFor="user">
              Nombre de usuario:{" "}
              <input
                id="user"
                type="text"
                placeholder="Nombre de usuario..."
                value={userName}
                required
                onChange={(e) => setUserName(e.target.value)}
              />
            </label>
            <button type="submit">Entrar</button>
          </form>
        </section>
      </main>
    );

  return (
    <main className="app">
      <h1>{`Chat room: ${chatRoom}`}</h1>
      <h4>Tu usuario: {userName}</h4>
      <section className="message-box">
        <ul>
          {chatMsg.length > 0 &&
            chatMsg.map((msg, msgIndex) => (
              <motion.li
                key={msgIndex}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {msg}
              </motion.li>
            ))}
          <div className="end-msg" ref={msgEndRef} />
        </ul>
      </section>
      <form onSubmit={onSubmitMessage}>
        <input
          type="text"
          placeholder="Escribe tu mensaje..."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />{" "}
        <button type="submit">Enviar</button>
      </form>
      <ConnectionMgr socket={socket} chatRoom={chatRoom} />
    </main>
  );
}

export default App;
