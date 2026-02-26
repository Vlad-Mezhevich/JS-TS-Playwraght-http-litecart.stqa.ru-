import { Page, Locator, expect } from '@playwright/test';

/**
 * PageObject описывающий cтраницу после успешного заказа товара
 */
export class OrderSuccessPage {
  readonly page: Page;
  readonly successTitle: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.successTitle = page.locator('div#box-order-success h1.title');
    this.successMessage = page.locator('div#box-order-success div.content p').nth(0);
  }

  // Получить текст заголовка
  private async getTitle() {
    return await this.successTitle.innerText();
  }

  // Получить основное сообщение
  private async getMessage() {
    return await this.successMessage.innerText();
  }

  // Сравнить ожидаемый текст с текущим заголовком
  async compareTitle(expectedTitle: string) {
    const actualTitle = await this.getTitle();
    return actualTitle.trim() === expectedTitle.trim();
  }

  // Сравнить ожидаемое сообщение с текущим
  async compareMessage(expectedMessage: string) {
    const actualMessage = await this.getMessage();
    return actualMessage.trim() === expectedMessage.trim();
  }
}