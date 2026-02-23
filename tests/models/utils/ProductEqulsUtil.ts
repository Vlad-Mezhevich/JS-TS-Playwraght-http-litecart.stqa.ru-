import { expect } from "@playwright/test";

export type CartItem = {
  title: string;
  quantity: number;
  totalPrice: number;
  urlProduct?: string;
};

/**
 * Класс для сравнения данных продуктов отображаемых на разных страницах
 */
export class ProductEqulsUtil {

  /**
   * Сравнивает два массива CartItem на полное совпадение по элементам.
   * Последовательность элементов не важна. Происходит сортировка 2-х массивов по @param title
   * 
   * @param arr1 - первый массив
   * @param arr2 - второй массив
   */
  static areEqualsCartItem(arr1: CartItem[], arr2: CartItem[]): void {
    if (arr1.length !== arr2.length) {
      expect(arr1.length).toBe(arr2.length); // Для вывода правильного сообщения
    }
    const sorted1 = [...arr1].sort((a, b) => a.title.localeCompare(b.title));
    const sorted2 = [...arr2].sort((a, b) => a.title.localeCompare(b.title));
    for (let i = 0; i < sorted1.length; i++) {
      const item1 = sorted1[i];
      const item2 = sorted2[i];
      expect(item1.title).toBe(item2.title);
      expect(item1.quantity).toBe(item2.quantity);
      expect(item1.totalPrice).toBeCloseTo(item2.totalPrice, 2);
    }
  }
}