import { expect, test, type Page } from '@playwright/test';

const APP_URL = 'https://demo.playwright.dev/todomvc/';

async function addTodo(page: Page, title: string) {
  const input = page.getByRole('textbox', { name: 'What needs to be done?' });
  await input.fill(title);
  await input.press('Enter');
}

async function addActiveAndCompletedTodos(page: Page) {
  await addTodo(page, 'Active task');
  await addTodo(page, 'Completed task');
  await page
    .getByTestId('todo-item')
    .filter({ hasText: 'Completed task' })
    .getByRole('checkbox', { name: 'Toggle Todo' })
    .check();
}

test.beforeEach(async ({ page }) => {
  await page.goto(APP_URL);
});

test('ADD-01 adds a task and clears the input', async ({ page }) => {
  await addTodo(page, 'Buy milk');

  await expect(page.getByTestId('todo-item')).toHaveCount(1);
  await expect(page.getByText('Buy milk', { exact: true })).toBeVisible();
  await expect(page.locator('.todo-count')).toHaveText('1 item left');
  await expect(
    page.getByRole('textbox', { name: 'What needs to be done?' }),
  ).toHaveValue('');
});

test('ADD-02 accepts duplicate task titles as separate tasks', async ({ page }) => {
  await addTodo(page, 'Buy milk');
  await addTodo(page, 'Buy milk');

  await expect(page.getByTestId('todo-item')).toHaveCount(2);
  await expect(page.getByText('Buy milk', { exact: true })).toHaveCount(2);
  await expect(page.locator('.todo-count')).toHaveText('2 items left');
});

test('ADD-03 trims surrounding whitespace from a task title', async ({ page }) => {
  await addTodo(page, '  spaced task  ');

  await expect(page.getByTestId('todo-item')).toHaveCount(1);
  await expect(page.getByText('spaced task', { exact: true })).toBeVisible();
});

test('ADD-04 accepts and displays a 256-character title', async ({ page }) => {
  const title = 'x'.repeat(256);
  await addTodo(page, title);

  await expect(page.getByTestId('todo-item')).toHaveCount(1);
  await expect(page.getByText(title, { exact: true })).toBeVisible();
});

test('ADD-05 does not add a task when Enter is pressed on an empty input', async ({
  page,
}) => {
  await page
    .getByRole('textbox', { name: 'What needs to be done?' })
    .press('Enter');

  await expect(page.getByTestId('todo-item')).toHaveCount(0);
  await expect(page.locator('.todo-count')).toHaveCount(0);
});

test('ADD-06 ignores a whitespace-only task title', async ({ page }) => {
  await addTodo(page, '   ');

  await expect(page.getByTestId('todo-item')).toHaveCount(0);
  await expect(page.locator('.todo-count')).toHaveCount(0);
});

test('DEL-01 deletes only the selected task', async ({ page }) => {
  await addTodo(page, 'Keep me');
  await addTodo(page, 'Delete me');
  const target = page.getByTestId('todo-item').filter({ hasText: 'Delete me' });
  await target.hover();
  await target.getByRole('button', { name: 'Delete' }).click();

  await expect(page.getByTestId('todo-item')).toHaveCount(1);
  await expect(page.getByText('Keep me', { exact: true })).toBeVisible();
  await expect(page.getByText('Delete me', { exact: true })).toHaveCount(0);
  await expect(page.locator('.todo-count')).toHaveText('1 item left');
});

test('DEL-02 hides task controls after deleting the last task', async ({ page }) => {
  await addTodo(page, 'Only task');
  const item = page.getByTestId('todo-item');
  await item.hover();
  await item.getByRole('button', { name: 'Delete' }).click();

  await expect(page.getByTestId('todo-item')).toHaveCount(0);
  await expect(
    page.getByRole('textbox', { name: 'What needs to be done?' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'todos' })).toBeVisible();
  await expect(page.locator('.todo-count')).toHaveCount(0);
  await expect(page.getByRole('checkbox', { name: /Mark all as complete/ })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'All' })).toHaveCount(0);
});

test('COMP-01 completes a task and updates the active count', async ({ page }) => {
  await addTodo(page, 'Complete me');
  const toggle = page
    .getByTestId('todo-item')
    .getByRole('checkbox', { name: 'Toggle Todo' });
  await toggle.check();

  await expect(toggle).toBeChecked();
  await expect(page.locator('.todo-count')).toHaveText('0 items left');
  await expect(page.getByRole('button', { name: 'Clear completed' })).toBeVisible();
});

test('COMP-02 marks every task complete', async ({ page }) => {
  await addTodo(page, 'First task');
  await addTodo(page, 'Second task');
  const markAll = page.getByRole('checkbox', { name: /Mark all as complete/ });
  await markAll.check();

  await expect(markAll).toBeChecked();
  await expect(page.getByTestId('todo-item')).toHaveCount(2);
  await expect(
    page.getByTestId('todo-item').getByRole('checkbox', { name: 'Toggle Todo' }).nth(0),
  ).toBeChecked();
  await expect(
    page.getByTestId('todo-item').getByRole('checkbox', { name: 'Toggle Todo' }).nth(1),
  ).toBeChecked();
  await expect(page.locator('.todo-count')).toHaveText('0 items left');
});

test('COMP-03 reactivates a completed task when its checkbox is cleared', async ({
  page,
}) => {
  await addTodo(page, 'Toggle task');
  const toggle = page
    .getByTestId('todo-item')
    .getByRole('checkbox', { name: 'Toggle Todo' });

  await toggle.check();
  await expect(page.locator('.todo-count')).toHaveText('0 items left');
  await toggle.uncheck();

  await expect(toggle).not.toBeChecked();
  await expect(page.locator('.todo-count')).toHaveText('1 item left');
});

test('FIL-01 All shows active and completed tasks', async ({ page }) => {
  await addActiveAndCompletedTodos(page);
  await page.getByRole('link', { name: 'All' }).click();

  await expect(page.getByTestId('todo-item')).toHaveCount(2);
  await expect(page.getByText('Active task', { exact: true })).toBeVisible();
  await expect(page.getByText('Completed task', { exact: true })).toBeVisible();
});

test('FIL-02 Active shows only active tasks', async ({ page }) => {
  await addActiveAndCompletedTodos(page);
  await page.getByRole('link', { name: 'Active' }).click();

  await expect(page.getByTestId('todo-item')).toHaveCount(1);
  await expect(page.getByText('Active task', { exact: true })).toBeVisible();
  await expect(page.getByText('Completed task', { exact: true })).toHaveCount(0);
  await expect(page.locator('.todo-count')).toHaveText('1 item left');
});

test('FIL-03 Completed shows only completed tasks', async ({ page }) => {
  await addActiveAndCompletedTodos(page);
  await page.getByRole('link', { name: 'Completed' }).click();

  await expect(page.getByTestId('todo-item')).toHaveCount(1);
  await expect(page.getByText('Completed task', { exact: true })).toBeVisible();
  await expect(page.getByText('Active task', { exact: true })).toHaveCount(0);
});

test('FIL-04 Active is empty when every task is completed', async ({ page }) => {
  await addTodo(page, 'First task');
  await addTodo(page, 'Second task');
  await page.getByRole('checkbox', { name: /Mark all as complete/ }).check();
  await page.getByRole('link', { name: 'Active' }).click();

  await expect(page.getByTestId('todo-item')).toHaveCount(0);
  await expect(page.locator('.todo-count')).toHaveText('0 items left');
  await expect(page.getByRole('link', { name: 'Active' })).toBeVisible();
});

test('CLR-01 removes completed tasks and preserves active tasks', async ({ page }) => {
  await addActiveAndCompletedTodos(page);
  await page.getByRole('button', { name: 'Clear completed' }).click();

  await expect(page.getByTestId('todo-item')).toHaveCount(1);
  await expect(page.getByText('Active task', { exact: true })).toBeVisible();
  await expect(page.getByText('Completed task', { exact: true })).toHaveCount(0);
  await expect(page.locator('.todo-count')).toHaveText('1 item left');
});

test('CLR-02 clears the list when all tasks are completed', async ({ page }) => {
  await addTodo(page, 'First task');
  await addTodo(page, 'Second task');
  await page.getByRole('checkbox', { name: /Mark all as complete/ }).check();
  await page.getByRole('button', { name: 'Clear completed' }).click();

  await expect(page.getByTestId('todo-item')).toHaveCount(0);
  await expect(
    page.getByRole('textbox', { name: 'What needs to be done?' }),
  ).toBeVisible();
  await expect(page.locator('.todo-count')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'All' })).toHaveCount(0);
});
