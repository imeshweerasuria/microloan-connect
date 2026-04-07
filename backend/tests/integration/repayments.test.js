const request = require("supertest");
const mongoose = require("mongoose");
require("dotenv").config();

jest.setTimeout(30000);

let app;
let borrowerToken;
let adminToken;
let loanId;
let borrowerId;

beforeAll(async () => {
  process.env.JWT_SECRET = "testsecret";

  const testUri = process.env.TEST_MONGO_URI;
  if (!testUri) {
    throw new Error("TEST_MONGO_URI is missing in .env");
  }

  process.env.MONGO_URI = testUri;

  const { connectDB } = require("../../src/config/db");
  await connectDB(process.env.MONGO_URI);

  app = require("../../src/app");
});

beforeEach(async () => {
  await mongoose.connection.db.dropDatabase();

  const borrowerRes = await request(app).post("/api/auth/register").send({
    name: "Borrower",
    email: "borrower@test.com",
    password: "password123",
    role: "BORROWER",
  });

  expect(borrowerRes.statusCode).toBe(201);
  borrowerToken = borrowerRes.body.token;
  borrowerId = borrowerRes.body.user.id;

  const adminRes = await request(app).post("/api/auth/register").send({
    name: "Admin",
    email: "admin@test.com",
    password: "password123",
    role: "ADMIN",
  });

  expect(adminRes.statusCode).toBe(201);
  adminToken = adminRes.body.token;

  const loanRes = await request(app)
    .post("/api/loans")
    .set("Authorization", `Bearer ${borrowerToken}`)
    .send({
      title: "Repayment Loan",
      description: "Loan for repayment testing",
      amount: 60000,
      currency: "LKR",
      tenureMonths: 12,
      purpose: "Working capital",
      businessCategory: "Retail",
      povertyImpactPlanSnapshot: "Increase family income",
    });

  expect(loanRes.statusCode).toBe(201);
  loanId = loanRes.body._id;
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

describe("Repayment API", () => {
  test("admin should create repayment schedule", async () => {
    const res = await request(app)
      .post("/api/repayments")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        loanId,
        borrowerId,
        dueDate: "2026-12-01",
        amountDue: 5000,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body._id).toBeDefined();
    expect(res.body.amountDue).toBe(5000);
    expect(res.body.status).toBe("PENDING");
    expect(String(res.body.borrowerId)).toBe(String(borrowerId));
    expect(String(res.body.loanId)).toBe(String(loanId));
  });

  test("borrower should pay repayment manually", async () => {
    const repaymentRes = await request(app)
      .post("/api/repayments")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        loanId,
        borrowerId,
        dueDate: "2026-12-01",
        amountDue: 5000,
      });

    expect(repaymentRes.statusCode).toBe(201);
    expect(repaymentRes.body._id).toBeDefined();

    const repaymentId = repaymentRes.body._id;

    const res = await request(app)
      .post(`/api/repayments/${repaymentId}/pay`)
      .set("Authorization", `Bearer ${borrowerToken}`)
      .send({
        amount: 2000,
        method: "CASH",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBeDefined();
    expect(res.body.amountPaid).toBe(2000);
    expect(res.body.status).toBe("PARTIAL");
  });

  test("borrower should list repayments by loan", async () => {
    const repaymentRes = await request(app)
      .post("/api/repayments")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        loanId,
        borrowerId,
        dueDate: "2026-12-01",
        amountDue: 5000,
      });

    expect(repaymentRes.statusCode).toBe(201);

    const res = await request(app)
      .get(`/api/repayments/loan/${loanId}`)
      .set("Authorization", `Bearer ${borrowerToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});