import { Page, Locator } from '@playwright/test';
import { CartItem } from './utils/ProductEqulsUtil';

/**
 * PageObject описывающий корзину заказов товаров.
 */
export class ShoppingCartPage {
  readonly page: Page;
  // Локаторы формы
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly address1Input: Locator;
  readonly address2Input: Locator;
  readonly postcodeInput: Locator;
  readonly cityInput: Locator;
  readonly countrySelect: Locator;
  readonly removeButton: Locator;
  // Локаторы раздела Order Summary
  readonly orderTable: Locator;
  readonly orderRows: Locator;
  readonly confirmButton: Locator;
  // Массив для хранения CartItem
  private cartItems: CartItem[] = [];

  constructor(page: Page) {
    this.page = page;
    // Инициализация формы данных пользователя customer_form
    this.firstNameInput = page.locator('input[name="firstname"]');
    this.lastNameInput = page.locator('input[name="lastname"]');
    this.address1Input = page.locator('input[name="address1"]');
    this.address2Input = page.locator('input[name="address2"]');
    this.postcodeInput = page.locator('input[name="postcode"]');
    this.cityInput = page.locator('input[name="city"]');
    this.countrySelect = page.locator('select[name="country_code"]');
    // Инициализация раздела Order Summary
    this.orderTable = page.locator('table.dataTable.rounded-corners');
    this.orderRows = this.orderTable.locator('tbody tr:not(.header):not(.footer)');
    this.confirmButton = page.locator('form[name="order_form"] button[type="submit"][name="confirm_order"]');
    // Инициализация элементов checkout-cart-wrapper
    this.removeButton = page.locator('button[name="remove_cart_item"]');
  }

  // Методы для заполнения формы
  async fillFirstName(name: string): Promise<void> {
    await this.firstNameInput.fill(name);
  }
  async fillLastName(name: string): Promise<void> {
    await this.lastNameInput.fill(name);
  }
  async fillAddress1(address: string): Promise<void> {
    await this.address1Input.fill(address);
  }
  async fillAddress2(address: string): Promise<void> {
    await this.address2Input.fill(address);
  }
  async fillPostcode(postcode: string): Promise<void> {
    await this.postcodeInput.fill(postcode);
  }
  async fillCity(city: string): Promise<void> {
    await this.cityInput.fill(city);
  }
  async selectCountry(countryCode: string): Promise<void> {
    await this.countrySelect.selectOption({ value: countryCode });
  }

  // Метод для заполнения всех полей
  async fillAllFields({
    firstName,
    lastName,
    address1,
    address2,
    postcode,
    city,
    countryCode,
  }: {
    firstName: string,
    lastName: string,
    address1: string,
    address2?: string,
    postcode: string,
    city: string,
    countryCode: string,
  }): Promise<void> {
    await this.fillFirstName(firstName);
    await this.fillLastName(lastName);
    await this.fillAddress1(address1);
    if (address2 !== undefined) {
      await this.fillAddress2(address2);
    }
    await this.fillPostcode(postcode);
    await this.fillCity(city);
    await this.selectCountry(countryCode);
  }

  // Клик по кнопке подтверждения
  async clickConfirmOrder(): Promise<void> {
    await this.confirmButton.click();
  }

  /**
   * Метод для создания массива CartItem из Order Summary
   */ 
  async saveCartItemsFromOrderSummary(): Promise<void> {
    this.cartItems = []; // очищаем перед сбором
    const count = await this.orderRows.count();
    for (let i = 0; i < count; i++) {
        const row = this.orderRows.nth(i);
        // Проверка наличия товарной строки
        const itemCell = row.locator('td.item');
        if ((await itemCell.count()) === 0) {
            continue;
        }
        const title = await itemCell.innerText();
        const quantityText = await row.locator('td').nth(0).innerText();
        const quantity = parseInt(quantityText.trim(), 10);
        const totalPriceText = await row.locator('td.sum').innerText();
        const totalPrice = parseFloat(totalPriceText.replace(/\$/g, '').trim());
        this.cartItems.push({ title, quantity, totalPrice });
    }
  }

  /**
   *  Метод для получения текущего массива CartItem
   */
  getShopCartProdutsArray(): CartItem[] {
    return this.cartItems;
  }

  /**
   * Клик по кнопке удалить товар из корзины
   */
  async clickRemoveButton(): Promise<void> {
    await this.removeButton.click();
  }
}