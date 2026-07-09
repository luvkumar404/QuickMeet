import assert from "node:assert/strict";
import { before, test } from "node:test";
import request from "supertest";

process.env.JWT_SECRET = "test-secret-that-is-at-least-thirty-two-characters";
process.env.CORS_ORIGIN = "http://localhost:5173";

let app;

before(async () => {
    const { createApp } = await import("../src/app.js");
    app = createApp();
});

test("GET /api/v1/health returns a consistent response", async () => {
    const response = await request(app).get("/api/v1/health").expect(200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.database, "disconnected");
});

test("unknown routes return JSON 404 responses", async () => {
    const response = await request(app).get("/api/v1/unknown").expect(404);
    assert.equal(response.body.success, false);
    assert.match(response.body.message, /Route not found/);
});

test("protected routes require a token", async () => {
    const response = await request(app).get("/api/v1/users/get_all_activity").expect(401);
    assert.equal(response.body.success, false);
    assert.match(response.body.message, /token is required/i);
});

test("disallowed browser origins are rejected", async () => {
    const response = await request(app)
        .get("/api/v1/health")
        .set("Origin", "https://not-allowed.example")
        .expect(403);
    assert.equal(response.body.success, false);
});
