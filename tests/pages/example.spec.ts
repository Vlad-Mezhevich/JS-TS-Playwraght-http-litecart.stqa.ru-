import { test, expect } from '@playwright/test';
import { MainPage } from '../models/MainPage';
import { LoginComponent } from '../models/components/LoginComponent';
import { ShoppingCartPage } from '../models/ShoppingCartPage';
import { ProductEqulsUtil } from '../models/utils/ProductEqulsUtil';
import { ProductPage } from '../models/ProductPage';
import { OrderSuccessPage } from '../models/OrderSuccessPage';
import { WaiterUtil } from '../models/utils/WaiterUtil';
import { PageUrls } from '../constant/PageUrls';

let mainPage: MainPage;
let loginComponent: LoginComponent;
let productPage: ProductPage;
let shoppingCartPage: ShoppingCartPage;
let orderSuccessPage: OrderSuccessPage;

test.beforeEach(async ({ page }) => {
  await page.goto(PageUrls.HOME_PAGE);
  mainPage = new MainPage(page);
  loginComponent = new LoginComponent(page);
  productPage = new ProductPage(page);
  shoppingCartPage = new ShoppingCartPage(page);
  orderSuccessPage = new OrderSuccessPage(page);
});

test('Test case 1 - Заказ одного товара без скидки', async ({ page }) => {
  await test.step('Шаг 1. Логин с тестовой учеткой', async () => {
    await loginComponent.login('test@test.com', '1234567890', false);
  });
  await test.step('Шаг 2. Выбираем один товар без скидки', async () => {
    await mainPage.loadProductsIndexes();
    await mainPage.goToNonDiscountedProductPage(0);
  });
  await test.step('Шаг 3. Добавляем в корзину 3шт выбранного товара', async () => {
    await productPage.editProductCount(3);
    await productPage.clickToCartButton();
    await productPage.saveCurrentProduct(3);
    await WaiterUtil.timeOut(2000);
    const cartQuantity = await mainPage.getCartQuantity();
    await WaiterUtil.timeOut(2000);
    expect(cartQuantity).toBe(3);
  });
  await test.step('Шаг 4. Осуществляем переход в корзину', async () => {
    await mainPage.clickButtonToCheckout();
    await WaiterUtil.timeOut(2000);
    await shoppingCartPage.saveCartItemsFromOrderSummary();
    ProductEqulsUtil.areEqualsCartItem(productPage.getProdutsArray(), shoppingCartPage.getShopCartProdutsArray());
  });
  await test.step('Шаг 5. Подтверждение заказа', async () => {
    await shoppingCartPage.clickConfirmOrder();
    await orderSuccessPage.compareTitle('Your order is successfully completed!');
    await orderSuccessPage.compareMessage('Thank you for shopping in our store. We will process your order shortly.');
  });
});

test('Test case 2 - Заказ одного товара со скидкой', async ({ page }) => {
  await test.step('Логин с тестовой учеткой', async () => {
    await loginComponent.login('test@test.com', '1234567890', false);
  });
  await test.step('Выбираем один товар со скидкой', async () => {
    await mainPage.loadProductsIndexes();
    await mainPage.goToDiscountedProductPage(0);
  });
  await test.step('Добавляем в корзину 2шт выбранного товара', async () => {
    await productPage.editProductCount(2);
    await productPage.selectOptionByText('Small');
    await productPage.clickToCartButton();
    await productPage.saveCurrentProduct(2);
    await WaiterUtil.timeOut(2000);
    const cartQuantity = await mainPage.getCartQuantity();
    await WaiterUtil.timeOut(2000);
    expect(cartQuantity).toBe(2);
  });
  await test.step('Осуществляем переход в корзину', async () => {
    await mainPage.clickButtonToCheckout();
    await WaiterUtil.timeOut(2000);
    await shoppingCartPage.saveCartItemsFromOrderSummary();
    ProductEqulsUtil.areEqualsCartItem(productPage.getProdutsArray(), shoppingCartPage.getShopCartProdutsArray());
  });
  await test.step('Подтверждение заказа', async () => {
    await shoppingCartPage.clickConfirmOrder();
    await orderSuccessPage.compareTitle('Your order is successfully completed!');
    await orderSuccessPage.compareMessage('Thank you for shopping in our store. We will process your order shortly.');
  });
});

test('Test case 3 - Заказ товара без логина', async ({ page }) => {
  await test.step('Шаг 1. Выбираем два разных товара и добавляем в корзину', async () => {
    await mainPage.loadProductsIndexes();
    await mainPage.goToNonDiscountedProductPage(0);
    await productPage.editProductCount(1);
    await productPage.saveCurrentProduct(1);
    await productPage.clickToCartButton();
    await mainPage.clickButtonToCheckout();
    await WaiterUtil.timeOut(2000);
    await shoppingCartPage.saveCartItemsFromOrderSummary();
    ProductEqulsUtil.areEqualsCartItem(productPage.getProdutsArray(), shoppingCartPage.getShopCartProdutsArray());
  });
  await test.step('Шаг 2. Проверка что пользователь не авторизован', async () => {
    await mainPage.goToHomePage();
    await loginComponent.checkLoginComponentsToBeVisible();
  });
  await test.step('Шаг 3. Возврат на домашнюю страницу', async () => {
    const urlProduct = await productPage.getUrlProductArray(0);
    await mainPage.expectLinkRecentlyViewedVisible(urlProduct);
  });

});

test('Test case 4 - Невалидный логин', async ({ page }) => {
  await test.step('Логин с некорректным паролем', async () => {
    await loginComponent.login('test@test.com', 'wrongpassword', false);
  });
  await test.step('Проверка вывода корректного сообщения об ошибке', async () => {
    await loginComponent.expectErrorMessage('Wrong password or the account is disabled, or does not exist')
  });
});
