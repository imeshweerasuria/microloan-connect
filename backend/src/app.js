const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

const authRoutes = require("./routes/authRoutes");
const borrowerRoutes = require("./routes/borrowerRoutes");
const loanRoutes = require("./routes/loanRoutes");
const repaymentRoutes = require("./routes/repaymentRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const exchangeRoutes = require("./routes/exchangeRoutes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/fx", require("./routes/fxRoutes"));

app.use("/api/borrowers", borrowerRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/repayments", repaymentRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/exchange-rate", exchangeRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
