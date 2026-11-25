const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const BASE = process.env.BASE_URL || "http://localhost:5173";
const API = process.env.API_URL || "http://localhost:5000/api";
const PASSWORD = "Passw0rd!";
const SHOT_DIR = path.join(__dirname, "screenshots");
fs.mkdirSync(SHOT_DIR, { recursive: true });

let driver;

// ---------- helpers ----------
const uniqueEmail = () =>
  `qa_${Date.now()}_${Math.floor(Math.random() * 1000)}@test.com`;

async function createUserViaApi() {
  const email = uniqueEmail();
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "QA User", email, password: PASSWORD }),
  });
  assert.strictEqual(res.status, 201, "API user creation failed");
  return email;
}

async function fillRegisterForm(name, email, password, confirm) {
  await driver.get(`${BASE}/register`);
  await driver.findElement(By.id("name")).sendKeys(name);
  await driver.findElement(By.id("email")).sendKeys(email);
  await driver.findElement(By.id("password")).sendKeys(password);
  await driver.findElement(By.id("confirmPassword")).sendKeys(confirm);
  await driver.findElement(By.css("button[type=submit]")).click();
}

async function loginViaUi(email, password) {
  await driver.get(`${BASE}/login`);
  await driver.findElement(By.id("email")).sendKeys(email);
  await driver.findElement(By.id("password")).sendKeys(password);
  await driver.findElement(By.css("button[type=submit]")).click();
}

async function waitForText(css) {
  const el = await driver.wait(until.elementLocated(By.css(css)), 10000);
  return el.getText();
}

// ---------- setup / teardown ----------
before(async function () {
  const options = new chrome.Options();
  if (process.env.HEADLESS === "true") options.addArguments("--headless=new");
  options.addArguments("--no-sandbox", "--window-size=1280,900");
  driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
});

after(async function () {
  if (driver) await driver.quit();
});

beforeEach(async function () {
  // start every test logged out
  await driver.get(BASE);
  await driver.executeScript("window.localStorage.clear();");
});

afterEach(async function () {
  // screenshot after every test = evidence for the report
  const id = this.currentTest.title.split(" ")[0];
  const suffix = this.currentTest.state === "failed" ? "-FAILED" : "";
  const png = await driver.takeScreenshot();
  fs.writeFileSync(path.join(SHOT_DIR, `${id}${suffix}.png`), png, "base64");
});

// ---------- tests ----------
describe("Registration", function () {
  it("TC-AUTO-001 registers a new user and lands on the dashboard", async function () {
    await fillRegisterForm("QA User", uniqueEmail(), PASSWORD, PASSWORD);
    await driver.wait(until.urlContains("/dashboard"), 10000);
  });

  it("TC-AUTO-002 rejects mismatched passwords", async function () {
    await fillRegisterForm("QA User", uniqueEmail(), PASSWORD, "Different1!");
    const text = await waitForText(".error-message");
    assert.ok(
      text.includes("Passwords do not match"),
      `Unexpected message: ${text}`,
    );
  });

  it("TC-AUTO-003 rejects a password shorter than 6 characters", async function () {
    await fillRegisterForm("QA User", uniqueEmail(), "12345", "12345");
    const text = await waitForText(".error-message");
    assert.ok(
      text.includes("at least 6 characters"),
      `Unexpected message: ${text}`,
    );
  });
});

describe("Login and route protection", function () {
  it("TC-AUTO-004 logs in with valid credentials", async function () {
    const email = await createUserViaApi();
    await loginViaUi(email, PASSWORD);
    await driver.wait(until.urlContains("/dashboard"), 10000);
  });

  it("TC-AUTO-005 rejects a wrong password", async function () {
    const email = await createUserViaApi();
    await loginViaUi(email, "WrongPass1!");
    const text = await waitForText(".error-message");
    assert.ok(
      text.includes("Invalid email or password"),
      `Unexpected message: ${text}`,
    );
  });

  it("TC-AUTO-006 redirects a logged-out user from /dashboard to /login", async function () {
    await driver.get(`${BASE}/dashboard`);
    await driver.wait(until.urlContains("/login"), 10000);
  });
});

describe("File upload", function () {
  async function openUploadPageLoggedIn() {
    const email = await createUserViaApi();
    await loginViaUi(email, PASSWORD);
    await driver.wait(until.urlContains("/dashboard"), 10000);
    await driver.get(`${BASE}/upload`);
    await driver.wait(until.elementLocated(By.id("document-file")), 10000);
  }

  it("TC-AUTO-007 uploads a valid PNG file", async function () {
    await openUploadPageLoggedIn();
    await driver
      .findElement(By.id("document-file"))
      .sendKeys(path.join(__dirname, "fixtures", "sample.png"));
    const button = await driver.findElement(By.css("button.upload-submit"));

    await driver.executeScript(
      "arguments[0].scrollIntoView({block: 'center'});",
      button,
    );

    await driver.wait(until.elementIsVisible(button), 5000);
    await driver.wait(until.elementIsEnabled(button), 5000);

    await driver.sleep(500);
    await button.click();

    await driver.executeScript(
      "arguments[0].scrollIntoView({block: 'center'});",
      button,
    );

    await driver.wait(until.elementIsVisible(button), 5000);
    await driver.wait(until.elementIsEnabled(button), 5000);

    await driver.sleep(500);
    await button.click();
    const text = await waitForText(".success-message");
    assert.ok(
      text.includes("uploaded successfully"),
      `Unexpected message: ${text}`,
    );
    await driver.wait(until.urlContains("/documents"), 10000);
  });

  it("TC-AUTO-008 rejects an unsupported .txt file", async function () {
    await openUploadPageLoggedIn();
    await driver
      .findElement(By.id("document-file"))
      .sendKeys(path.join(__dirname, "fixtures", "notes.txt"));
    const text = await waitForText(".error-message");
    assert.ok(text.includes("JPG, PNG or PDF"), `Unexpected message: ${text}`);
  });
});
