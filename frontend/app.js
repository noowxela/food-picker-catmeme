const express = require("express");
require("express-group-routes");
const cors = require("cors");
const path = require("path");
const app = express();
require("dotenv").config();
const fs = require("fs");
const compression = require("compression");

// Disable 'x-powered-by' header for security
app.disable("x-powered-by");

app.get("/assets/js/config.js", (req, res) => {
  const apiBase = process.env.API_BASE || "http://localhost:3000/v1/";
  res.type("application/javascript");
  res.send(
    [
      `window.API_BASE = ${JSON.stringify(apiBase)};`,
      `window.CAT_API_KEY = ${JSON.stringify(process.env.CAT_API_KEY || "")};`,
    ].join("\n")
  );
});

// Use compression middleware for response compression
app.use(compression());

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Parse JSON and URL-encoded data in incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS (Cross-Origin Resource Sharing) for cross-origin requests
app.use(cors());

// Serve static files from the "assets" directory under the "/assets" route
app.use("/assets", express.static("assets"));

// Redirect URLs ending with a trailing slash to URLs without it
// app.use((req, res, next) => {
//   if (req.path.substring(req.path.length - 1) == "/" && req.path.length > 1) {
//     const query = req.url.slice(req.path.length);
//     res.redirect(301, req.path.slice(0, -1) + query);
//   } else {
//     next();
//   }
// });

app.get("/", function (req, res) {
  res.sendFile("pages/index.html", { root: __dirname });
});

app.get(["/home", "/index.html"], (req, res) => {
  res.sendFile("pages/index.html", { root: __dirname });
});

app.get(["/restaurants", "/restaurants.html"], function (req, res) {
  res.sendFile("pages/restaurants.html", { root: __dirname });
});

app.get(["/history", "/history.html"], function (req, res) {
  res.sendFile("pages/history.html", { root: __dirname });
});

app.get("/main.js", function (req, res) {
  res.sendFile("pages/main.js", { root: __dirname });
});

// Handle unknown routes with a 404 status
app.get("/{*splat}", function (req, res) {
  res.status(404).send("unknown");
});

// Get the port from the environment variables and start the server
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});
