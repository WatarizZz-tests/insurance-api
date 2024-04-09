const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const router = express.Router();
const path = require("path");
const moment = require ("moment");
const {format} = require("date-fns");

const date = new Date();
const formattedDateTime = format(date, 'dd_MM_yyyy_HH_mm');
console.log(formattedDateTime);

dotenv.config();

const allowedOrigins = [
  'https://insurance-service.vercel.app/',
  'https://insurance-service.vercel.app',
  https://leet-z-assurance.vercel.app/,
  https://leet-z-assurance.vercel.app,
  'http://localhost:3000',
  'http://localhost:3001'
];

app.use(cors({
  origin: allowedOrigins
}));


mongoose.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to MongoDB");
  }
);
app.get("/",(req,res) => {
  res.json("Hello");
  })
app.use("/images", express.static(path.join(__dirname, "public/images")));

//middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, moment().format('YYYY_MM_DD_HH_mm') + `_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("File uploded successfully");
  } catch (error) {
    console.error(error);
  }
});

app.post("/api/multifiles", upload.array("files"), (req, res) => {
  const files = req.files;

  if (Array.isArray(files) && files.length > 0) {
    res.json(files);
  } else {
    throw new Error("File upload unsuccessful");
  }
});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);

const PORT = process.env.PORT || 8800;


app.listen(PORT , () => {
  console.log("Backend server is running! and the port is " + PORT)
})
