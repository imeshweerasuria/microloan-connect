const request = require("supertest");
const mongoose = require("mongoose");
require("dotenv").config();

jest.setTimeout(30000);

let app;
let borrowerToken;
let adminToken;
let lenderToken;

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
  borrowerToken = borrowerRes.body.token;

  const adminRes = await request(app).post("/api/auth/register").send({
    name: "Admin",
    email: "admin@test.com",
    password: "password123",
    role: "ADMIN",
  });
  adminToken = adminRes.body.token;

  const lenderRes = await request(app).post("/api/auth/register").send({
    name: "Lender",
    email: "lender@test.com",
    password: "password123",
    role: "LENDER",
  });
  lenderToken = lenderRes.body.token;
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

describe("Loan API", () => {
  test("borrower should create a loan", async () => {
    const res = await request(app)
      .post("/api/loans")
      .set("Authorization", `Bearer ${borrowerToken}`)
      .send({
        title: "Small Business Loan",
        description: "Need funds for expansion",
        amount: 50000,
        currency: "LKR",
        tenureMonths: 12,
        purpose: "Business expansion",
        businessCategory: "Retail",
        povertyImpactPlanSnapshot: "Increase income and create jobs",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("Small Business Loan");
    expect(res.body.status).toBe("DRAFT");
  });

  test("borrower should list own loans", async () => {
    await request(app)
      .post("/api/loans")
      .set("Authorization", `Bearer ${borrowerToken}`)
      .send({
        title: "Loan 1",
        description: "Loan description",
        amount: 20000,
        currency: "LKR",
        tenureMonths: 6,
        purpose: "Equipment",
        businessCategory: "Tailoring",
        povertyImpactPlanSnapshot: "Grow income",
      });

    const res = await request(app)
      .get("/api/loans/me")
      .set("Authorization", `Bearer ${borrowerToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });

  test("admin should approve submitted loan", async () => {
    const createRes = await request(app)
      .post("/api/loans")
      .set("Authorization", `Bearer ${borrowerToken}`)
      .send({
        title: "Approval Loan",
        description: "Need approval",
        amount: 30000,
        currency: "LKR",
        tenureMonths: 10,
        purpose: "Inventory",
        businessCategory: "Grocery",
        povertyImpactPlanSnapshot: "Improve household income",
      });

    const loanId = createRes.body._id;

    await request(app)
      .put(`/api/loans/${loanId}`)
      .set("Authorization", `Bearer ${borrowerToken}`)
      .send({ status: "SUBMITTED" });

    const res = await request(app)
      .patch(`/api/loans/${loanId}/approve`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.loan.status).toBe("APPROVED");
  });

  test("lender should browse approved loans", async () => {
    const createRes = await request(app)
      .post("/api/loans")
      .set("Authorization", `Bearer ${borrowerToken}`)
      .send({
        title: "Browse Loan",
        description: "Visible to lenders",
        amount: 40000,
        currency: "LKR",
        tenureMonths: 8,
        purpose: "Supplies",
        businessCategory: "Retail",
        povertyImpactPlanSnapshot: "Expand operations",
      });

    const loanId = createRes.body._id;

    await request(app)
      .put(`/api/loans/${loanId}`)
      .set("Authorization", `Bearer ${borrowerToken}`)
      .send({ status: "SUBMITTED" });

    await request(app)
      .patch(`/api/loans/${loanId}/approve`)
      .set("Authorization", `Bearer ${adminToken}`);

    const res = await request(app)
      .get("/api/loans?status=APPROVED")
      .set("Authorization", `Bearer ${lenderToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});