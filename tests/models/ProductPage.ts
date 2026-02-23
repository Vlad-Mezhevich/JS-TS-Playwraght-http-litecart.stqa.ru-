import { Locator, Page } from '@playwright/test';
import { CartItem } from './utils/ProductEqulsUtil';

/**
 * PageObject описывающий страницу товаров.
 */
export class ProductPage {
  readonly page: Page;
  readonly title: Locator;
  readonly price: Locator;
  readonly priceWithDiscount: Locator;
  readonly regularPrice: Locator;
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;
  readonly selectLocator: Locator;
  readonly optionsDiscountSelect: Locator;

  private cartItems: CartItem[] = [];
  
  constructor(page: Page) {
    this.page = page;
    // Основные элементы страницы
    this.title = page.locator('#box-product h1.title');
    this.price = page.locator('#box-product .price-wrapper .price');
    this.priceWithDiscount = page.locator('.price-wrapper .campaign-price');
    this.regularPrice = page.locator('.price-wrapper .regular-price');
    this.quantityInput = page.locator('input[name="quantity"]');
    this.addToCartButton = page.locator('button[name="add_cart_product"]');
    // Опции которые видны для товаров со скидками
    this.selectLocator = page.locator('select[name="options[Size]"]');
    this.optionsDiscountSelect = this.selectLocator.locator('option');
  }

  /**
   * Установить количество товара
   */ 
  async editProductCount(quantity: number): Promise<void> {
    await this.quantityInput.fill(quantity.toString());
  }

  /**
   * Кликнуть кнопку "Добавить в корзину"
   */ 
  async clickToCartButton(): Promise<void> {
    await this.addToCartButton.click();
  }
  
/**
 * Метод который проверяет наличие элемента на странице, посредством поиска кол-ва его на странице.
 * В случае если элементов 0, то метод возвращает false, иначе true
 * @param locator 
 * @returns 
 */
  private async isElementVisible(locator: Locator): Promise<boolean> {
    try {
      const count = await locator.count();
      if (count === 0) return false;
      return await locator.isVisible();
    } catch (e) {
      return false;
    }
  }

  /**
   * Получает цену товара, учитывая наличие скидки.
   * Если есть цена со скидкой — возвращает её, иначе обычную.
   */
  async getEffectivePrice(): Promise<string> {
    if (await this.isElementVisible(this.priceWithDiscount)) {
        return (await this.priceWithDiscount.textContent()) || '';
    }
    if (await this.isElementVisible(this.price)) {
        return (await this.price.textContent()) || '';
    }
    return '';
  }

  /**
   * Сохраняет данные текущего товара в массив savedItems.
   * Извлекает название и цену товара, умножает цену на количество.
   * @param quantity - количество текущего товара для сохранения
   */
  async saveCurrentProduct(quantity: number): Promise<void> {
    const title = (await this.title.textContent()) || '';
    const priceText = await this.getEffectivePrice();
    const priceNumber = parseFloat(priceText.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;

    // Получаем число из выбранной опции
    const optionNumber = await this.getNumberFromSelectedOption();

    const totalPrice = (priceNumber + optionNumber) * quantity;
    const urlProduct = this.page.url();
    this.cartItems.push({ title, quantity, totalPrice, urlProduct });
  }

  /**
   * Возвращает массив всех сохранённых товаров.
   * @returns Массив объектов CartItem с заголовком, количеством и суммой
   */
  getProdutsArray(): CartItem[] {
    return this.cartItems;
  }

  /**
   * Метод возращает url продукта и массива
   * @param index номер элемента в массиве
   * @returns 
   */
  async getUrlProductArray(index: number): Promise<string> {
    return this.cartItems[index]?.urlProduct ?? '';;
  }

  /**
   * Выбрать опцию по тексту
   */
  async selectOptionByText(text: string): Promise<void> {
    await this.selectLocator.selectOption({ label: text });
  }

  /**
   * Выбрать конкретный элемент <option> и кликнуть по нему  
   */ 
  async clickOptionByText(text: string): Promise<void> {
    const option = this.optionsDiscountSelect.filter({ hasText: text });
    await option.click();
  }

  /**
   * Получить число из выбранной опции; возвращает 0 если число не найдено
   */ 
  async getNumberFromSelectedOption(): Promise<number> {
    const selectedOption = this.page.locator('select[name="options[Size]"] option:checked');
    // Проверяем, видим ли локатор
    if (!(await selectedOption.isVisible())) {
      return 0;
    }
    const optionText = await selectedOption.innerText();
    const regex = /\d+/;
    const match = optionText.match(regex);
    if (match) {
      return parseInt(match[0], 10);
    }
    return 0;
  }
  
}