export class UniqueRandomNumberGenerator {
  private used: Set<number> = new Set();
  private min: number;
  private max: number;

  constructor(min: number, max: number) {
    this.min = Math.ceil(min);
    this.max = Math.floor(max);
  }

  getRandomNumber(): number {
    const rangeSize = this.max - this.min + 1;

    if (this.used.size >= rangeSize) {
      throw new Error("All unique numbers in the range have been exhausted");
    }

    let num: number;

    do {
      num = Math.floor(Math.random() * rangeSize) + this.min;
    } while (this.used.has(num));

    this.used.add(num);

    return num;
  }
}