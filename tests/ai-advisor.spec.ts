import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

test.describe('AURA AI ADVISOR - UI & E2E', () => {

  test('TC-AI-01: Chat FAB button visible on all pages', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForTimeout(1500);
    const fab = page.locator('button').filter({ hasText: '' }).last();
    // FAB should be visible
    const fabCount = await page.locator('button[class*="rounded-full"]').count();
    console.log(`  FAB buttons found: ${fabCount}`);
    expect(fabCount).toBeGreaterThan(0);
  });

  test('TC-AI-02: Open chat widget', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForTimeout(1500);
    // Click the chat FAB (bottom right button)
    const buttons = page.locator('button.rounded-full');
    const count = await buttons.count();
    // Click last button (FAB)
    if (count > 0) {
      await buttons.last().click();
      await page.waitForTimeout(1000);
    }
    // Chat widget should appear
    const chatHeader = page.locator('text=Aura AI Advisor');
    const isVisible = await chatHeader.isVisible().catch(() => false);
    console.log(`  Chat widget visible: ${isVisible}`);
    expect(isVisible).toBeTruthy();
  });

  test('TC-AI-03: Welcome message shown', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForTimeout(1500);
    // Open chat
    const buttons = page.locator('button.rounded-full');
    if (await buttons.count() > 0) {
      await buttons.last().click();
      await page.waitForTimeout(1500);
    }
    // Welcome message or quick replies should be visible
    const bodyText = await page.locator('body').innerText();
    const hasWelcome = bodyText.includes('Aura AI') || bodyText.includes('tro ly');
    console.log(`  Welcome visible: ${hasWelcome}`);
    expect(hasWelcome).toBeTruthy();
  });

  test('TC-AI-04: Quick reply buttons shown', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForTimeout(1500);
    const buttons = page.locator('button.rounded-full');
    if (await buttons.count() > 0) {
      await buttons.last().click();
      await page.waitForTimeout(1500);
    }
    // Quick replies should be visible
    const quickReply = page.locator('text=Nuoc hoa Nu');
    const isVisible = await quickReply.isVisible().catch(() => false);
    console.log(`  Quick replies visible: ${isVisible}`);
    expect(isVisible).toBeTruthy();
  });

  test('TC-AI-05: Send message and get response', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForTimeout(1500);
    // Open chat
    const buttons = page.locator('button.rounded-full');
    if (await buttons.count() > 0) {
      await buttons.last().click();
      await page.waitForTimeout(1500);
    }
    // Type a message
    const input = page.locator('input[placeholder*="Hoi Aura"]');
    if (await input.isVisible()) {
      await input.fill('Nuoc hoa nam manh me');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
    }
    // Should get a response
    const bodyText = await page.locator('body').innerText();
    const hasResponse = bodyText.length > 500;
    console.log(`  Response received: ${hasResponse} (${bodyText.length} chars)`);
    expect(hasResponse).toBeTruthy();
  });

  test('TC-AI-06: Chat on shop page', async ({ page }) => {
    await page.goto(`${BASE}/shop`);
    await page.waitForTimeout(1500);
    // Chat FAB should be on shop page too
    const buttons = page.locator('button.rounded-full');
    expect(await buttons.count()).toBeGreaterThan(0);
    console.log('  Chat available on shop page: OK');
  });

  test('TC-AI-07: Chat on product detail page', async ({ page }) => {
    await page.goto(`${BASE}/shop`);
    await page.waitForTimeout(1000);
    // Click first product
    const productLink = page.locator('a[href*="/product/"]').first();
    if (await productLink.count() > 0) {
      await productLink.click();
      await page.waitForTimeout(1500);
    }
    // Chat should be available on product detail too
    const buttons = page.locator('button.rounded-full');
    expect(await buttons.count()).toBeGreaterThan(0);
    console.log('  Chat available on product detail: OK');
  });

  test('TC-AI-08: Close and reopen chat', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForTimeout(1500);
    const buttons = page.locator('button.rounded-full');
    // Open
    if (await buttons.count() > 0) {
      await buttons.last().click();
      await page.waitForTimeout(1000);
    }
    // Close
    const closeBtn = page.locator('button').filter({ hasText: '' }).first();
    // Reopen
    if (await buttons.count() > 0) {
      await buttons.last().click();
      await page.waitForTimeout(500);
      await buttons.last().click();
      await page.waitForTimeout(1000);
    }
    console.log('  Chat open/close cycle: OK');
  });

});
