import { expect, Locator, Page } from "@playwright/test";
import { WaiterUtil } from "./utils/WaiterUtil";

export interface ProductInfo {
  name: string;
  manufacturer: string;
  price: string;
  regularPrice?: string;
  campaignPrice?: string;
  href: string;
  imageSrc: string;
  hasSaleSticker: boolean;
}

/**
 * PageObject описывающий главную cтраницу сайта
 */
export class MainPage {
  readonly page: Page;
  // Локаторы контейнера и списка продуктов
  private containerLocator: Locator;
  private productsLocator: Locator;
  // Индексы продуктов с и без скидок
  discountedProductIndexes: number[] = [];
  nonDiscountedProductIndexes: number[] = [];
  // Локаторы меню и ссылок меню
  private siteMenuLocator: Locator;
  private homeLink: Locator;
  private rubberDucksLink: Locator;
  private subcategoryLink: Locator;
  // Локаторы корзины
  private cartLocator: Locator;
  private cartQuantityLocator: Locator;
  private cartTotalPriceLocator: Locator;
  private cartLinkLocator: Locator;
  // Локаторы блока Recently Viewed
  readonly rootRecentlyViewed: Locator;
  readonly linksRecentlyViewed: Locator;

  constructor(page: Page) {
    this.page = page;
    this.containerLocator = this.page.locator('#box-most-popular');
    this.productsLocator = this.containerLocator.locator('ul.listing-wrapper.products > li.product');
    this.siteMenuLocator = this.page.locator('nav#site-menu');
    this.homeLink = this.siteMenuLocator.locator('li.general-0 > a');
    this.rubberDucksLink = this.siteMenuLocator.locator('li.category-1 > a');
    this.subcategoryLink = this.siteMenuLocator.locator('li.category-2 > a');
    // Инициализация локаторов корзины
    this.cartLocator = this.page.locator('#cart');
    this.cartQuantityLocator = this.cartLocator.locator('span.quantity');
    this.cartTotalPriceLocator = this.cartLocator.locator('span.formatted_value');
    this.cartLinkLocator = this.cartLocator.locator('a.link'); // ссылка "Checkout »"
    // Инициализация локаторов Recently Viewed
    // ближайший корень элемента блока
    this.rootRecentlyViewed = page.locator('#box-recently-viewed-products');
    // все ссылки внутри этого блока
    this.linksRecentlyViewed = this.rootRecentlyViewed.locator('ul.list-horizontal li a');

  }

  /** Возвращает количество продуктов в блоке популярные */
  async getProductsCount(): Promise<number> {
    return await this.productsLocator.count();
  }

  /** Получает информацию о продукте по индексу */
  async getProductInfo(index: number): Promise<ProductInfo> {
    const product = this.productsLocator.nth(index);
    const name = await product.locator('.name').innerText();
    const manufacturer = await product.locator('.manufacturer').innerText();
    const href = (await product.locator('a.link').getAttribute('href')) ?? '';
    const imageSrc = (await product.locator('img.image').getAttribute('src')) ?? '';
    const hasSaleSticker = (await product.locator('.image-wrapper .sticker.sale').count()) > 0;
    const priceLocator = product.locator('.price-wrapper .price').first();
    const price = (await priceLocator.count() > 0) ? (await priceLocator.innerText()).trim() : '';
    const regularPriceLocator = product.locator('.price-wrapper s.regular-price').first();
    const regularPrice = (await regularPriceLocator.count() > 0) ? (await regularPriceLocator.innerText()).trim() : undefined;
    const campaignPriceLocator = product.locator('.price-wrapper strong.campaign-price').first();
    const campaignPrice = (await campaignPriceLocator.count() > 0) ? (await campaignPriceLocator.innerText()).trim() : undefined;
    return {
      name,
      manufacturer,
      href,
      imageSrc,
      hasSaleSticker,
      price,
      regularPrice,
      campaignPrice,
    };
  }

  /** 
   * Кликает по ссылке продукта по индексу (переход на страницу товара) 
   */
  async clickProductLink(index: number): Promise<void> {
    await this.productsLocator.nth(index).locator('a.link').click();
  }

  /** 
   * Загружает и разделяет индексы продуктов: со скидкой и без скидки
   */
  async loadProductsIndexes(): Promise<void> {
    const productsCount = await this.getProductsCount();

    this.discountedProductIndexes = [];
    this.nonDiscountedProductIndexes = [];

    for (let i = 0; i < productsCount; i++) {
      const hasSale = (await this.productsLocator.nth(i).locator('.image-wrapper .sticker.sale').count()) > 0;
      if (hasSale) {
        this.discountedProductIndexes.push(i);
      } else {
        this.nonDiscountedProductIndexes.push(i);
      }
    }
  }

  /** 
  * Возвращает количество товаров в корзине 
  */
  async getCartQuantity(): Promise<number> {
    const quantityText = await this.cartQuantityLocator.textContent();
    return quantityText ? parseInt(quantityText.trim(), 10) : 0;
  }

  /** 
   * Возвращает сумму товаров в корзине в виде строки 
   */
  async getCartTotalPrice(): Promise<string> {
    return (await this.cartTotalPriceLocator.textContent())?.trim() ?? '';
  }

  /** 
   * Переходит на страницу оформления заказа (клик по ссылке "Checkout »") 
   */
  async clickButtonToCheckout(): Promise<void> {
    await WaiterUtil.timeOut(5000);
    await this.cartLinkLocator.click();
  }



  /** 
   * Переходит на страницу товара со скидкой из популярных товаров на главной страницы
   */
  async goToDiscountedProductPage(position?: number): Promise<void> {
    const index = this._getDiscountedProductIndex(position);
    await this.clickProductLink(index);
  }

  /**
   * Переходит на страницу товара без скидки из популярных товаров на главной страницы
   */
  async goToNonDiscountedProductPage(position?: number): Promise<void> {
    const index = this._getNonDiscountedProductIndex(position);
    await this.clickProductLink(index);
  }

  /** 
   * Переходит по ссылке меню «Домой» 
   */
  async goToHomePage(): Promise<void> {
    await this.homeLink.click();
  }

  /** 
   * Переходит по ссылке меню «Rubber Ducks» 
   */
  async goToRubberDucksPage(): Promise<void> {
    await this.rubberDucksLink.click();
  }

  /** 
   * Переходит по ссылке меню «Subcategory» 
   */
  async goToSubcategoryPage(): Promise<void> {
    await this.subcategoryLink.click();
  }

  // Получить список ссылок как массив строк
  async getLinkHrefs(): Promise<string[]> {
    return await this.linksRecentlyViewed.evaluateAll((nodes) =>
      nodes.map((node) => (node as HTMLAnchorElement).href)
    );
  }

  // Проверка, содержит ли блок конкретную ссылку
  async containsLink(url: string): Promise<boolean> {
    const linksHrefs = await this.getLinkHrefs();
    return linksHrefs.includes(url);
  }

  // Проверяет что ссылка на товар присутствует в блоке Recently 
  async expectLinkRecentlyViewedVisible(url: string): Promise<void> {
    const link = this.rootRecentlyViewed.locator(`ul.list-horizontal li a[href="${url}"]`);
    await expect(link).toBeVisible();
  }

  // Вспомогательные приватные методы выбора индексов продуктов
  private _getDiscountedProductIndex(position?: number): number {
    const length = this.discountedProductIndexes.length;
    if (length === 0) throw new Error('Нет товаров со скидкой');
    if (position !== undefined) {
      if (position < 0 || position >= length) {
        throw new Error(`Позиция вне диапазона (0..${length - 1})`);
      }
      return this.discountedProductIndexes[position];
    }
    const randomIndex = Math.floor(Math.random() * length);
    return this.discountedProductIndexes[randomIndex];
  }

  private _getNonDiscountedProductIndex(position?: number): number {
    const length = this.nonDiscountedProductIndexes.length;
    if (length === 0) throw new Error('Нет товаров без скидки');
    if (position !== undefined) {
      if (position < 0 || position >= length) {
        throw new Error(`Позиция вне диапазона (0..${length - 1})`);
      }
      return this.nonDiscountedProductIndexes[position];
    }
    const randomIndex = Math.floor(Math.random() * length);
    return this.nonDiscountedProductIndexes[randomIndex];
  }

}