import { Locator, Page, expect } from '@playwright/test';

/**
 * Класс для авторизации пользователей вынесен в компоненты, так как дублируется элементы на главной странице в боковом меню
 * и на странице ../login
 */
export class LoginComponent {
  readonly page: Page;

  private loginForm: Locator;
  private emailInput: Locator;
  private passwordInput: Locator;
  private rememberMeCheckbox: Locator;
  private loginButton: Locator;
  private lostPasswordButton: Locator;
  private newCustomersLink: Locator;
  private errorNotice: Locator;

  constructor(page: Page) {
    this.page = page;

    this.loginForm = this.page.locator('#box-account-login form[name="login_form"]');
    this.emailInput = this.loginForm.locator('input[name="email"]');
    this.passwordInput = this.loginForm.locator('input[name="password"]');
    this.rememberMeCheckbox = this.loginForm.locator('input[name="remember_me"]');
    this.loginButton = this.loginForm.locator('button[name="login"]');
    this.lostPasswordButton = this.loginForm.locator('button[name="lost_password"]');
    this.newCustomersLink = this.loginForm.locator('a[href*="create_account"]');
    this.errorNotice = this.page.locator('#notices .notice.errors');
  }

  async enterEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async enterPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async setCheckBoxRememberMe(remember: boolean): Promise<void> {
    const checked = await this.rememberMeCheckbox.isChecked();
    if (checked !== remember) {
      await this.rememberMeCheckbox.click();
    }
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  async clickLostPassword(): Promise<void> {
    await this.lostPasswordButton.click();
  }

  async clickNewCustomersLink(): Promise<void> {
    await this.newCustomersLink.click();
  }

  /** Полная авторизация */
  async login(email: string, password: string, rememberMe = false): Promise<void> {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.setCheckBoxRememberMe(rememberMe);
    await this.clickLogin();
  }

  /** Проверить, что ошибка отображается с нужным текстом */
  async expectErrorMessage(expectedText: string): Promise<void> {
    await expect(this.errorNotice).toBeVisible();
    await expect(this.errorNotice).toContainText(expectedText);
  }

  async checkLoginComponentsToBeVisible(): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
  }
}