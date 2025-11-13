import { Position } from "./Position";

export type PositionMapLines<T> = Map<number, PositionMapLine<T>>;

export type PositionMapLine<T> = Map<number, T>;

export class PositionMap<T> {
  lines: PositionMapLines<T>;

  constructor(entriesOrMap?: [Position, T][] | PositionMap<T>) {
    this.lines = new Map();
    if (entriesOrMap) {
      this.add(entriesOrMap);
    }
  }

  add(entriesOrMap: [Position, T][] | PositionMap<T>): this {
    if (Array.isArray(entriesOrMap)) {
      for (const [position, t] of entriesOrMap) {
        this.set(position, t);
      }
    } else {
      for (const [position, t] of entriesOrMap.entries()) {
        this.set(position, t);
      }
    }
    return this;
  }

  *entries(): Iterable<[Position, T]> {
    for (const [y, line] of this.lines.entries()) {
      for (const [x, t] of line.entries()) {
        yield [{ x, y }, t];
      }
    }
  }

  has({ x, y }: Position): boolean {
    if (!this.lines.has(y)) {
      return false;
    }
    const line = this.lines.get(y)!;
    return line.has(x);
  }

  get({ x, y }: Position): T | undefined {
    if (!this.lines.has(y)) {
      return undefined;
    }
    const line = this.lines.get(y)!;
    return line.get(x);
  }

  set({ x, y }: Position, t: T) {
    if (!this.lines.has(y)) {
      this.lines.set(y, new Map());
    }
    const line = this.lines.get(y)!;
    line.set(x, t);
  }
}
