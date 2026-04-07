const request = require("supertest");
const mongoose = require("mongoose");
require("dotenv").config();

jest.setTimeout(30000);

let app;

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
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

describe("Auth API", () => {
  test("should register a borrower", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Borrower User",
      email: "borrower@test.com",
      password: "password123",
      role: "BORROWER",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("borrower@test.com");
    expect(res.body.user.role).toBe("BORROWER");
  });

  test("should login a registered user", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Login User",
      email: "login@test.com",
      password: "password123",
      role: "BORROWER",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "login@test.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("login@test.com");
  });

  test("should reject login with wrong password", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Wrong Password User",
      email: "wrong@test.com",
      password: "password123",
      role: "BORROWER",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "wrong@test.com",
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/Invalid credentials/i);
  });
});