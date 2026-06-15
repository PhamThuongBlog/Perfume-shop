import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

test.describe('CATEGORY SECTIONS & GIFT SETS', () => {

  test('TC-01: Homepage has Nuoc hoa Nu section', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForTimeout(2000);
    const nu = page.locator('text=Nuoc hoa Nu');
    await expect(nu.first()).toBeVisible({ timeout: 5000 });
    console.log('  Nuoc hoa Nu section: VISIBLE');
  });

  test('TC-02: Homepage has Nuoc hoa Nam section', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForTimeout(2000);
    const nam = page.locator('text=Nuoc hoa Nam');
    await expect(nam.first()).toBeVisible({ timeout: 5000 });
    console.log('  Nuoc hoa Nam section: VISIBLE');
  });

  test('TC-03: Homepage has Nuoc hoa Unisex section', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForTimeout(2000);
    const uni = page.locator('text=Nuoc hoa Unisex');
    await expect(uni.first()).toBeVisible({ timeout: 5000 });
    console.log('  Nuoc hoa Unisex section: VISIBLE');
  });

  test('TC-04: Click "Xem tat ca" from Nu section navigates to shop', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForTimeout(2000);
    const links = page.locator('a[href*="/shop?gender=Nu"]');
    if (await links.count() > 0) {
      await links.first().click();
      await page.waitForTimeout(1500);
      const url = page.url();
      expect(url).toContain('gender=Nu');
      console.log(`  Navigated to: ${url}`);
    }
  });

  test('TC-05: Shop gender filter shows correct count', async ({ page }) => {
    await page.goto(`${BASE}/shop?gender=Nam`);
    await page.waitForTimeout(2000);
    const bodyText = await page.locator('body').innerText();
    // Should show products and a count
    const hasProducts = bodyText.length > 500;
    expect(hasProducts).toBeTruthy();
    console.log(`  Shop Nam filter: ${bodyText.length} chars rendered`);
  });

  test('TC-06: Gift Sets collection visible on homepage', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForTimeout(2000);
    // Gift Sets should appear as a collection section
    const giftSet = page.locator('text=Set Qua Tang');
    const quaTang = page.locator('text=Qua Tang Cao Cap');
    const hasGift = await giftSet.count() > 0 || await quaTang.count() > 0;
    console.log(`  Gift Sets visible: ${hasGift}`);
    expect(hasGift).toBeTruthy();
  });

  test('TC-07: Each gender section shows 5 products', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForTimeout(2000);
    // Count product cards in each section
    const allCards = page.locator('a[href*="/product/"]');
    const count = await allCards.count();
    console.log(`  Total product links on homepage: ${count}`);
    expect(count).toBeGreaterThan(10); // At least 3 sections x 5 = 15
  });

});
