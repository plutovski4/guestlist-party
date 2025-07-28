const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public")); // <- Toto sprístupní /public ako frontend

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html")); // <- Dôležité!
});


app.listen(PORT, () => {
  console.log(`Server beží na porte ${PORT}`);
});
