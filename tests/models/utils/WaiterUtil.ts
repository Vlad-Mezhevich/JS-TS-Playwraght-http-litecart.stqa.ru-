export class WaiterUtil {

  static async timeOut(number : number) : Promise<void> {
    await new Promise(resolve => setTimeout(resolve, number));
  }

}