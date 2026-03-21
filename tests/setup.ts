import "@testing-library/jest-dom";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

/**
 * MSW (Mock Service Worker) setup — intercepts fetch calls in tests
 */

// Default mock handlers — can be overridden per test
export const handlers = [
  // Default: /api/chat returns success
  http.post(`*/api/chat`, async ({ request }) => {
    return HttpResponse.json({
      reply: "Mock response from gateway",
      sources: [],
      warnings: [],
      cached: false,
    });
  }),

  // Default: /api/chat/stream returns SSE success
  http.post(`*/api/chat/stream`, () => {
    return new HttpResponse(
      `data: {"type":"token","content":"Mock token"}\ndata: {"type":"done","content":"Mock response"}\n`,
      {
        headers: { "Content-Type": "text/event-stream" },
      }
    );
  }),

  // Auth verify endpoint
  http.post(`*/auth/verify`, async ({ request }) => {
    return HttpResponse.json({ user_id: "test-user-123" });
  }),
];

// Setup server
const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());

// Export server for per-test overrides
export { server };
