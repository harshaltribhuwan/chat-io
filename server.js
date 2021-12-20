var express = require("express");
var app = express();
var server = require("http").createServer(app);
const io = require("socket.io")(server);
const PORT = process.env.PORT || 5000;
var usernames = [];

server.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.sockets.on("connection", function (socket) {
  console.log("socket is connected");

  socket.on("new user", function (data, callback) {
    if (usernames.indexOf(data) != -1) {
      callback(false);
    } else {
      callback(true);
      socket.username = data;
      usernames.push(socket.username);
      updateUsernames();
    }
  });

  //Update usernames

  function updateUsernames() {
    io.sockets.emit("usernames", usernames);
  }

  // Send message
  socket.on("send message", function (data) {
    io.sockets.emit("new message", { msg: data, user: socket.username });
  });

  //Disconnect
  socket.on("disconnect", function (data) {
    if (!socket.username) return;
    usernames.splice(usernames.indexOf(socket.username), 1);
    updateUsernames();
  });
});
