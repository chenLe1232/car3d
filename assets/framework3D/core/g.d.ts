interface String {
  format(...args): string;
}
interface Date {
  format(fmtStr): string;
}

interface Number {
  toUnitString(fix?: number): string;
}

declare class g {
  static getRandom<T>(arr: T[]): T;
}
