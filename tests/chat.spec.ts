/**
 * Chat functional tests — require Next.js + gateway running.
 *
 * Run: npx playwright test tests/chat.spec.ts
 *
 * Note: These tests bypass Next.js auth by calling the gateway directly
 * with X-Test-User-Id header (dev mode only). The web Playwright tests
 * verify the UI renders and the gateway responds — not full auth flow.
 */

import { test, expect } from '@playwright/test';

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:2080';
const TEST_USER_ID = 'test-playwright-web';

test.describe('Gateway API (called from web context)', () => {
  test('gateway health is up', async ({ request }) => {
    const response = await request.get(`${GATEWAY_URL}/health`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(['healthy', 'degraded']).toContain(data.status);
  });

  test('chat without auth returns 401', async ({ request }) => {
    const response = await request.post(`${GATEWAY_URL}/api/chat`, {
      data: { message: 'hola' },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status()).toBe(401);
  });

  test('chat with test header returns reply', async ({ request }) => {
    const response = await request.post(`${GATEWAY_URL}/api/chat`, {
      data: { message: '¿Cuándo son las elecciones 2026?' },
      headers: {
        'Content-Type': 'application/json',
        'X-Test-User-Id': TEST_USER_ID,
      },
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.reply).toBeTruthy();
    expect(data.reply.length).toBeGreaterThan(20);
  });

  test('chat reply contains electoral context for electoral query', async ({ request }) => {
    const response = await request.post(`${GATEWAY_URL}/api/chat`, {
      data: { message: '¿Quiénes son los candidatos presidenciales?' },
      headers: {
        'Content-Type': 'application/json',
        'X-Test-User-Id': TEST_USER_ID,
      },
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    const replyLower = data.reply.toLowerCase();
    expect(
      replyLower.includes('candidato') ||
      replyLower.includes('partido') ||
      replyLower.includes('presidente') ||
      replyLower.includes('elección')
    ).toBeTruthy();
  });

  test('chat responds to greeting without error', async ({ request }) => {
    const response = await request.post(`${GATEWAY_URL}/api/chat`, {
      data: { message: 'hola' },
      headers: {
        'Content-Type': 'application/json',
        'X-Test-User-Id': TEST_USER_ID,
      },
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.reply).toBeTruthy();
    // Greeting should mention VOTI or elections
    expect(data.reply.toLowerCase()).toMatch(/voti|elecciones|candidat|votar/);
  });
});
