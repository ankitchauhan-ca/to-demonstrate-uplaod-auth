const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const users = [];
const secretKey = process.env.JWT_SECRET || "your_secret_key";

const uploadsDir = "./uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.post("/register", (req, res) => {
  const { username, password } = req.body;
  users.push({ username, password });
  res.status(201).send("User registered");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    const token = jwt.sign({ username }, secretKey);
    res.json({ token });
  } else {
    res.status(401).send("Invalid credentials");
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send("No file uploaded");

  res.json({
    message: "File uploaded successfully",
    fileName: file.originalname,
    fileType: file.mimetype,
    fileSize: file.size,
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
