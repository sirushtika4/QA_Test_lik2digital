
/**
 * EC4206 - Software Testing and Quality Assurance
 * Ink2Digital - Authentication Unit Testing
 *
 * Test modules:
 * 1. User Registration
 * 2. User Login
 * 3. User Profile Retrieval
 *
 * Testing Framework: Jest
 */

// Mock database model
jest.mock("../models/User", () => ({
  findOne: jest.fn(),
  create: jest.fn()
}));

// Mock password hashing
jest.mock("bcryptjs", () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn()
}));

// Mock JWT generation
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn()
}));

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
  registerUser,
  loginUser,
  getMe
} = require("../controllers/authController");

// Create mock Express response
const mockResponse = () => {
  const res = {};

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);

  return res;
};

// Reset mocks before every test
beforeEach(() => {
  jest.resetAllMocks();
  process.env.JWT_SECRET = "test-only-secret";
});

// ==========================================
// PART 1 - USER REGISTRATION TESTING
// ==========================================

describe("User Registration Unit Tests", () => {

  test("UT01 - Missing required fields", async () => {
    const req = {
      body: {
        name: "",
        email: "",
        password: ""
      }
    };

    const res = mockResponse();

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false
      })
    );

    expect(User.findOne).not.toHaveBeenCalled();
  });

  test("UT02 - Password shorter than 6 characters", async () => {
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
    expect(User.create).not.toHaveBeenCalled();
  });

  test("UT03 - Duplicate email registration", async () => {
    User.findOne.mockResolvedValue({
      _id: "existing-user"
    });

    const req = {
      body: {
        name: "Student",
        email: "student@example.com",
        password: "123456"
      }
    };

    const res = mockResponse();

    await registerUser(req, res);

    expect(User.findOne).toHaveBeenCalledWith({
      email: "student@example.com"
    });

    expect(res.status).toHaveBeenCalledWith(409);
    expect(User.create).not.toHaveBeenCalled();
  });

  test("UT04 - Successful registration", async () => {
    User.findOne.mockResolvedValue(null);
    bcrypt.genSalt.mockResolvedValue("mock-salt");
    bcrypt.hash.mockResolvedValue("hashed-password");

    User.create.mockResolvedValue({
      _id: "new-user-id",
      name: "Student",
      email: "student@example.com"
    });

    jwt.sign.mockReturnValue("registration-token");

    const req = {
      body: {
        name: "Student",
        email: "STUDENT@example.com",
        password: "123456"
      }
    };

    const res = mockResponse();

    await registerUser(req, res);

    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);

    expect(bcrypt.hash).toHaveBeenCalledWith(
      "123456",
      "mock-salt"
    );

    expect(User.create).toHaveBeenCalledWith({
      name: "Student",
      email: "student@example.com",
      password: "hashed-password"
    });

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: "new-user-id" },
      "test-only-secret",
      { expiresIn: "7d" }
    );

    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        token: "registration-token"
      })
    );
  });

  test("UT05 - Registration database error", async () => {
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

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false
        })
      );
    } finally {
      consoleSpy.mockRestore();
    }
  });
});

// ==========================================
// PART 2 - USER LOGIN TESTING
// ==========================================

describe("User Login Unit Tests", () => {

  test("UT06 - Missing login credentials", async () => {
    const req = {
      body: {
        email: "",
        password: ""
      }
    };

    const res = mockResponse();

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(User.findOne).not.toHaveBeenCalled();
  });

  test("UT07 - Unregistered email", async () => {
    User.findOne.mockResolvedValue(null);

    const req = {
      body: {
        email: "unknown@example.com",
        password: "123456"
      }
    };

    const res = mockResponse();

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  test("UT08 - Incorrect password", async () => {
    User.findOne.mockResolvedValue({
      _id: "user-1",
      email: "student@example.com",
      password: "hashed-password"
    });

    bcrypt.compare.mockResolvedValue(false);

    const req = {
      body: {
        email: "student@example.com",
        password: "wrongpassword"
      }
    };

    const res = mockResponse();

    await loginUser(req, res);

    expect(bcrypt.compare).toHaveBeenCalledWith(
      "wrongpassword",
      "hashed-password"
    );

    expect(res.status).toHaveBeenCalledWith(401);
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  test("UT09 - Successful login", async () => {
    User.findOne.mockResolvedValue({
      _id: "user-1",
      name: "Student",
      email: "student@example.com",
      password: "hashed-password"
    });

    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("login-token");

    const req = {
      body: {
        email: "STUDENT@example.com",
        password: "correctpassword"
      }
    };

    const res = mockResponse();

    await loginUser(req, res);

    expect(User.findOne).toHaveBeenCalledWith({
      email: "student@example.com"
    });

    expect(bcrypt.compare).toHaveBeenCalledWith(
      "correctpassword",
      "hashed-password"
    );

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        token: "login-token",
        user: expect.objectContaining({
          name: "Student",
          email: "student@example.com"
        })
      })
    );
  });

  test("UT10 - Login database error", async () => {
    User.findOne.mockRejectedValue(
      new Error("Database unavailable")
    );

    const req = {
      body: {
        email: "student@example.com",
        password: "123456"
      }
    };

    const res = mockResponse();

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    try {
      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false
        })
      );
    } finally {
      consoleSpy.mockRestore();
    }
  });
});

// ==========================================
// PART 3 - USER PROFILE TESTING
// ==========================================

describe("User Profile Unit Tests", () => {

  test("UT11 - Successfully retrieve user profile", async () => {
    const req = {
      user: {
        _id: "user-1",
        name: "Student",
        email: "student@example.com",
        profileImage: null
      }
    };

    const res = mockResponse();

    await getMe(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      user: {
        id: "user-1",
        name: "Student",
        email: "student@example.com",
        profileImage: null
      }
    });
  });

  test("UT12 - Profile retrieval error", async () => {
    const req = {};
    const res = mockResponse();

    await getMe(req, res);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Unable to retrieve user information."
      })
    );
  });
});

