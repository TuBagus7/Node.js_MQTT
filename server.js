const mqtt = require("mqtt");
const express = require("express");
const path = require("path");
const app = express();

const client = mqtt.connect("mqtt://broker.emqx.io");
const port = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "views")));

// root aplikasi
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/event", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  client.on("message", (topic, message) => {
    console.log(`Pesan diterima: ${topic} | ${message}`);
    const data = JSON.stringify({ topic, message: message.toString() });
    res.write(`data: ${data}\n\n`);
  });
});

app.post("/publish", express.json(), (req, res) => {
  const { topic, message } = req.body;
  client.publish(topic, message);
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

// connect and subscribe
client.on("connect", () => {
  console.log("Berhasil terhubung ke server");

  // Subscribe to both topics for sensor data
  client.subscribe("timbangan/load", (err) => {
    if (!err) {
      console.log("Berhasil subscribe ke topik timbangan/load");
    } else {
      console.log(err);
    }
  });

  client.subscribe("timbangan/pot", (err) => {
    if (!err) {
      console.log("Berhasil subscribe ke topik timbangan/pot");
    } else {
      console.log(err);
    }
  });
});
