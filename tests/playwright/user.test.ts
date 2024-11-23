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

// test.describe("Dashboard Interactions", () => {
//   test.beforeEach(async ({ page }) => {
//     // Login before each test
//     await page.goto("/sign-in");
//     await page.fill('input[name="email"]', "user@example.com");
//     await page.fill('input[name="password"]', "password");
//     await page.click('button[type="submit"]');
//   });

//   test("add new course", async ({ page }) => {
//     await page.goto("/protected");
//     await page.click('button:has-text("Add Class")');
//     await page.fill('input[name="courseName"]', "Test 1");
//     await page.click('button[type="submit"]');
//     // Check that the course is visible on the dashboard
//     await expect(page.getByText("Test Course One")).toBeVisible();
//   });

//   test("navigate to course detail page", async ({ page }) => {
//     await page.goto("/protected");
//     await page.click('div:has-text("Test Course One")');
//     await expect(page).toHaveURL(/\/course\/\d+/);
//     await expect(page.getByRole("heading")).toContainText("Test Course One");
//   });

//   // TODO: Add tests for:
//   // - Course deletion
//   // - Course color change
//   // - Editing course details
// });

// // TODO: Add tests for course material management.
