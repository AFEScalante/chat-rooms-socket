export function getUser(socket) {
  const userId = socket.id.substr(0, 4);
  return <span className="username">{`anon${userId}`}: </span>;
}
