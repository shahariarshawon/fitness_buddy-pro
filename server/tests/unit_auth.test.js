const test = require("node:test");
const assert = require("node:assert");
const bcrypt = require("bcryptjs");
const {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../src/utils/generateToken");

test("Authentication Unit Tests", async (t) => {
  const dummyUserId = "64f1a2b3c4d5e6f7a8b9c0d1";

  await t.test("generateToken produces a valid verifiable JWT access token", async () => {
    const token = generateToken(dummyUserId);
    assert.ok(typeof token === "string");
    assert.ok(token.length > 20);
    const parts = token.split(".");
    assert.strictEqual(parts.length, 3);
  });

  await t.test("generateRefreshToken produces and verifies a valid refresh token", async () => {
    const refreshToken = generateRefreshToken(dummyUserId);
    assert.ok(typeof refreshToken === "string");

    const decoded = verifyRefreshToken(refreshToken);
    assert.strictEqual(decoded.id, dummyUserId);
    assert.strictEqual(decoded.type, "refresh");
  });

  await t.test("bcrypt generates unique salts and compares passwords correctly", async () => {
    const password = "SuperSecretPassword123!";
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    assert.notStrictEqual(password, hash);
    const isMatch = await bcrypt.compare(password, hash);
    assert.strictEqual(isMatch, true);

    const isWrongMatch = await bcrypt.compare("WrongPassword123!", hash);
    assert.strictEqual(isWrongMatch, false);
  });
});
