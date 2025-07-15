export function ConnectionMgr({ socket, chatRoom }) {
  function leaveRoom() {
    socket.emit("leave-room", chatRoom);
  }

  return (
    <div className="connections">
      <button onClick={leaveRoom}>Salir del room</button>
    </div>
  );
}
