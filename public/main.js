const socket = io();

const params = new URLSearchParams(window.location.search);
const username = params.get("username");
const room = params.get("room");

document.getElementById("roomName").innerText = "Room: " + room;

socket.emit("joinRoom", { username, room });

const msgForm = document.getElementById("msgForm");
const msg = document.getElementById("msg");
const messages = document.getElementById("messages");
const typing = document.getElementById("typing");
const usersList = document.getElementById("users");

function addMessage(data) {
  if (!data.message || data.message.trim().length === 0) {
    return;
  }

  const isSelf = data.username === username;
  const msgClass = isSelf ? "message self" : "message";

  const time = data.timestamp
    ? new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  typing.innerText = "";

  messages.innerHTML += `
    <div class="${msgClass}">
      <div class="message-header">
        <span class="username">${data.username}</span>
        <span class="time">${time}</span>
      </div>
      <div class="message-text">${data.message}</div>
    </div>
  `;

  messages.scrollTop = messages.scrollHeight;
}

msgForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (msg.value.trim()) {
    socket.emit("chatMessage", msg.value);
    msg.value = "";
  }
});

msg.addEventListener("input", () => {
  socket.emit("typing");
});

socket.on("loadMessages", function (msgs) {
  messages.innerHTML = ""; // Clear existing messages before loading to avoid duplicates if reconnected
  for (let i = 0; i < msgs.length; i++) {
    addMessage(msgs[i]);
  }
  messages.scrollTop = messages.scrollHeight;
});

socket.on("message", (data) => {
  addMessage(data);
});

socket.on("notification", (msg) => {
  messages.innerHTML += `<p class="notify">${msg}</p>`;
});

socket.on("typing", (msg) => {
  typing.innerText = msg;
  setTimeout(() => {
    typing.innerText = "";
  }, 2000);
});

socket.on("userList", (users) => {
  usersList.innerHTML = "";
  users.forEach((u) => {
    usersList.innerHTML += `<li>${u.username}</li>`;
  });

});
