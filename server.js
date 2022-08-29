const http = require("http");
const express = require("express");
const WebSocket = require("ws");

// Configure express for serving files
const app = express();
app.use(express.json({ extended: false }));
app.use(express.static("public"));
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/public/driver.html");
});
app.get("/robot", (request, response) => {
  response.sendFile(__dirname + "/public/d3.html");
});
app.get("/sidebar", (request, response) => {
  response.sendFile(__dirname + "/public/sidebar.html");
});

// Launch express server
const server = http.createServer(app);

// Launch websocket server
const webSocketServer = new WebSocket.Server({ server });
process.env.PORT = 8080;
server.listen(process.env.PORT, () => {
  console.info(`Server running on port: ${process.env.PORT}`);
});
console.info(webSocketServer.readyState);

webSocketServer.on("connection", socket => {
  socket.send("Connected to Browser");
  console.info("Total connected clients:", webSocketServer.clients.size);
  app.locals.clients = webSocketServer.clients;
  console.info(webSocketServer.readyState);
  // Send all messages to all other clients
  socket.on("message", message => {
    webSocketServer.clients.forEach(client => {
      if (client != socket && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  // End call when any client disconnects
  socket.on("close", () => {
    webSocketServer.clients.forEach(client => {
      if (client != socket && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "endCall" }));
      }
    });
  });
  
  socket.send("Hello from server");
});