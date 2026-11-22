
const {
  Given,
  When,
  Then,
  Before
} = require("@cucumber/cucumber");

const assert = require("node:assert/strict");
const request = require("supertest");

const BASE_URL =
  process.env.TEST_BASE_URL || "http://localhost:5000";

let response;

Before(function () {
  response = undefined;
});

Given("the registration service is available", function () {
  // The Express backend must already be running.
});

Given("the email address is not already registered", function () {
  // Use a unique email in the successful registration step.
});

When("I register with a missing name", async function () {
  response = await request(BASE_URL)
    .post("/api/auth/register")
    .send({
      name: "",
      email: "test@example.com",
      password: "123456"
    });
});

When(
  "I register with a password shorter than 6 characters",
  async function () {
    response = await request(BASE_URL)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "123"
      });
  }
);

When("I register with valid details", async function () {
  const uniqueEmail = `qa-${Date.now()}@example.com`;

  response = await request(BASE_URL)
    .post("/api/auth/register")
    .send({
      name: "QA Test User",
      email: uniqueEmail,
      password: "Test123456"
    });
});

Then(
  "the registration status should be {int}",
  function (expectedStatus) {
    assert.ok(response, "No HTTP response was received");
    assert.equal(response.status, expectedStatus);
  }
);
