const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

const authRoutes = require("./routes/authRoutes");
const borrowerRoutes = require("./routes/borrowerRoutes");
const communityRoutes = require("./routes/communityRoutes");
const loanRoutes = require("./routes/loanRoutes");
const repaymentRoutes = require("./routes/repaymentRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const fxRoutes = require("./routes/fxRoutes");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://microloan-connect.vercel.app",
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/fx", fxRoutes);
app.use("/api/borrowers", borrowerRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/repayments", repaymentRoutes);
app.use("/api/transactions", transactionRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;