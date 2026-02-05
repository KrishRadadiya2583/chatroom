
const Msg = require("../models/msg");
const users = {};

module.exports = (io) => {
  io.on("connection", async (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinRoom", async ({ username, room }) => {
      socket.join(room);

      users[socket.id] = { username, room };



      socket.broadcast.to(room).emit("notification", `${username} joined ${room}`);


      const roomUsers = Object.values(users).filter(
        (u) => u.room === room
      );

       async function loadMessages() {
      const messages = await Msg.find().sort({ timestamp: -1 }).limit(15);
      socket.emit("loadMessages", messages.reverse());
    }
    loadMessages();


      io.to(room).emit("userList", roomUsers);


    });

    socket.on("chatMessage", async (msg) => {
      const user = users[socket.id];
      if (!user) return;

      const timestamp = new Date();

      io.to(user.room).emit("message", {
        username: user.username,
        message: msg,
        timestamp: timestamp
      });


      const message = new Msg({
        username: user.username,
        message: msg,
        timestamp: timestamp
      });

      await message.save();
      console.log("Message saved to database");

    });

    socket.on("typing", () => {
      const user = users[socket.id];
      if (!user) return;

      socket.broadcast.to(user.room).emit("typing", `${user.username} is typing...`);
    });

   

    socket.on("disconnect", () => {
      const user = users[socket.id];
      if (user) {
        socket.broadcast.to(user.room).emit("notification", `${user.username} left the chat`);

        delete users[socket.id];

        const roomUsers = Object.values(users).filter(
          (u) => u.room === user.room
        );

        io.to(user.room).emit("userList", roomUsers);
      }
      console.log("User disconnected:", socket.id);
    });
  });
};
