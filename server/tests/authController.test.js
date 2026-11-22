
jest.mock("../models/User", () => ({
  findOne: jest.fn(),
  create: jest.fn()
}));

jest.mock("bcryptjs", () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn()
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn()
}));

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  registerUser
} = require("../controllers/authController");

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Registration Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-only-secret";
  });

  test("WB01: Missing required fields", async () => {
    const req = {
      body: { name: "", email: "", password: "" }
    };
    const res = mockResponse();

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(User.findOne).not.toHaveBeenCalled();
  });

  test("WB02: Password shorter than 6 characters", async () => {
    const req = {
      body: {
        name: "Student",
        email: "student@example.com",
        password: "123"
      }
    };
    const res = mockResponse();

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("WB03: Duplicate email", async () => {
    User.findOne.mockResolvedValue({ _id: "existing-id" });

    const req = {
      body: {
        name: "Student",
        email: "student@example.com",
        password: "123456"
      }
    };
    const res = mockResponse();

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  test("WB04: Successful registration", async () => {
    User.findOne.mockResolvedValue(null);
    bcrypt.genSalt.mockResolvedValue("salt");
    bcrypt.hash.mockResolvedValue("hashed-password");
    User.create.mockResolvedValue({
      _id: "new-user-id",
      name: "Student",
      email: "student@example.com"
    });
    jwt.sign.mockReturnValue("test-token");

    const req = {
      body: {
        name: "Student",
        email: "student@example.com",
        password: "123456"
      }
    };
    const res = mockResponse();

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(User.create).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        token: "test-token"
      })
    );
  });

  test("WB05: Database error", async () => {
    User.findOne.mockRejectedValue(
      new Error("Database unavailable")
    );

    const req = {
      body: {
        name: "Student",
        email: "student@example.com",
        password: "123456"
      }
    };
    const res = mockResponse();

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    try {
      await registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    } finally {
      consoleSpy.mockRestore();
    }
  });
});
