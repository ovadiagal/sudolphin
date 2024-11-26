import { test, expect } from "@playwright/test";

// Test that the homepage has the correct title
test("homepage has correct title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Sudolphin");
});

// Test the login flow
test.describe("Authentication Flow", () => {
  test("successful login", async ({ page }) => {
    await page.goto("/sign-in");
    // Attempt to login with test credentials
    await page.fill('input[name="email"]', "user@example.com");
    await page.fill('input[name="password"]', "password");
    await page.click('button[type="submit"]');
    // Check that the user is redirected to the dashboard
    await expect(page).toHaveURL("/protected");
  });

  test("invalid login", async ({ page }) => {
    await page.goto("/sign-in");
    // Attempt to login with invalid credentials
    await page.fill('input[name="email"]', "randomWrongEmail@example.com");
    await page.fill('input[name="password"]', "randomWrongPassword");
    await page.click('button[type="submit"]');
    // Check that the user is shown an error message
    await expect(page).toHaveURL("/sign-in");
  });
});

test.describe.serial("Dashboard Interactions", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/sign-in");
    await page.fill('input[name="email"]', "user@example.com");
    await page.fill('input[name="password"]', "password");
    await page.click('button[type="submit"]');
    await Promise.all([
      // Wait for redirect to protected route
      page.waitForURL('/protected'),
    ]);
  });

  test("add new course (default color)", async ({ page }) => {
    await page.goto("/protected");
    await page.locator('div').filter({ hasText: /^Add Class$/ }).nth(2).click();
    // Fill in class name
    const newClassName = "Test Course One";
    await page.fill('input[name="className"]', newClassName);
    await page.getByRole("button", { name: "Create Class" }).click();
    await expect(page.getByText(newClassName)).toBeVisible();
  });

  test("add new course (selected color)", async ({ page }) => {
    await page.goto("/protected");
    await page.locator('div').filter({ hasText: /^Add Class$/ }).click();
    await page.fill('input[name="className"]', "Test Course Two");
    // Select a color for the course
    // Bad practice to hardcode the color, but buttons don't have unique identifiers
    await page.locator('button[style*="rgb(6, 182, 212)"]').click();
    await page.getByRole("button", { name: "Create Class" }).click();
    // Check that the course is visible on the dashboard
    await expect(page.getByText("Test Course Two")).toBeVisible();
    // Find the course div by text content and verify its color
    const courseDiv = await page.locator("div.rounded-lg", {
      has: page.getByText("Test Course Two"),
    });
    // Get the background color from the style attribute
    const backgroundColor = await courseDiv.getAttribute("style");
    expect(backgroundColor).toContain("background-color: rgb(6, 182, 212);");
  });

  test("navigate to course detail page", async ({ page }) => {
    await page.goto("/protected");
    await page.getByRole('link', { name: 'Test Course One' }).click();
    await expect(page).toHaveURL(/\/class\/\d+/);
    await expect(page.getByRole('heading', { name: 'Test Course One' }).textContent()).resolves.toBe('Test Course One');
  });

  test("delete course from dashboard", async ({ page }) => {
    await page.goto("/protected");
    const courseText = "Test Course One";
    await page.getByRole('button').nth(3).click();
    await expect(page.getByText(courseText)).not.toBeVisible();
  });

  test("delete course from dashboard (two)", async ({ page }) => {
    await page.goto("/protected");
    const courseText = "Test Course Two";
    await page.getByRole('button').nth(1).click();

    await expect(page.getByText(courseText)).not.toBeVisible();
  });

  test("add new course for files (default color)", async ({ page }) => {
    await page.goto("/protected");
    await page.locator('div').filter({ hasText: /^Add Class$/ }).nth(2).click();
    // Fill in class name
    const newClassName = "File Upload Test Course";
    await page.fill('input[name="className"]', newClassName);
    await page.getByRole("button", { name: "Create Class" }).click();
    await expect(page.getByText(newClassName)).toBeVisible();
  });

  test("successful file upload", async ({ page }) => {
    await page.goto("/protected");
    await page.getByRole('link', { name: 'File Upload Test Course' }).click();
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.locator('div').filter({ hasText: /^Drag and drop files here, or click to select$/ }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles("./tests/playwright/shrek_textbasedPDF.pdf");
    await expect(page.getByText("Upload Complete!")).toBeVisible();
  });

  test("file upload (multiple files)", async ({ page }) => {
    await page.goto("/protected");
    await page.getByRole('link', { name: 'File Upload Test Course' }).click();
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.locator('div').filter({ hasText: /^Drag and drop files here, or click to select$/ }).click();
    const fileChooser = await fileChooserPromise;
    const filesToUpload = [
      './tests/playwright/shrek_textbasedPDF.pdf',
      './tests/playwright/shrek2_textbasedPDF.pdf'
    ];
    await fileChooser.setFiles(filesToUpload);
    await expect(page.getByText("Upload Complete!")).toBeVisible();
  });

  test("delete file upload course from dashboard", async ({ page }) => {
    await page.goto("/protected");
    const courseText = "File Upload Test Course";
    await page.getByRole('button').nth(1).click();
    await expect(page.getByText(courseText)).not.toBeVisible();
  });
});