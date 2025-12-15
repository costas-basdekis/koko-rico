export interface HistoryItem<T> {
  checkIsNext(this: T, previous: T): boolean;
  checkIsSame(this: T, other: T): boolean;
  createStack(this: T): T[];
}

export class ItemHistory<T extends HistoryItem<T>> {
  stack: T[];
  index: number;

  static initial<T extends HistoryItem<T>>(item: T): ItemHistory<T> {
    return this.fromStack([...item.createStack(), item]);
  }

  static fromStack<T extends HistoryItem<T>>(stack: T[]): ItemHistory<T> {
    return new this(stack, stack.length - 1);
  }

  constructor(stack: T[], index: number) {
    if (!stack[index]) {
      throw new Error(
        `Out of bounds: stack length of ${stack.length} but index ${index}`,
      );
    }
    this.stack = stack;
    this.index = index;
  }

  change({
    stack = this.stack,
    index = this.index,
  }: Partial<ItemHistory<T>>): ItemHistory<T> {
    return new (this.constructor as typeof ItemHistory<T>)(stack, index);
  }

  get current(): T {
    return this.stack[this.index];
  }

  canUndo(): boolean {
    return this.index > 0;
  }

  getUndoItem(): T | undefined {
    if (!this.canUndo()) {
      return undefined;
    }
    return this.stack[this.index - 1];
  }

  undo(): ItemHistory<T> {
    if (!this.canUndo()) {
      return this;
    }
    return this.change({ index: this.index - 1 });
  }

  undoAll(): ItemHistory<T> {
    if (!this.canUndo()) {
      return this;
    }
    return this.change({ index: 0 });
  }

  canRedo(): boolean {
    return this.index < this.stack.length - 1;
  }

  getRedoItem(): T | undefined {
    if (!this.canRedo) {
      return undefined;
    }
    return this.stack[this.index + 1];
  }

  redo(): ItemHistory<T> {
    if (!this.canRedo()) {
      return this;
    }
    return this.change({ index: this.index + 1 });
  }

  redoAll(): ItemHistory<T> {
    if (!this.canRedo()) {
      return this;
    }
    return this.change({ index: this.stack.length - 1 });
  }

  setCurrent(item: T): ItemHistory<T> {
    const index = this.stack.indexOf(item);
    if (index >= 0) {
      return this.change({ index });
    }
    if (item.checkIsNext(this.current)) {
      return this.change({
        stack: [...this.stack.slice(0, this.index + 1), item],
        index: this.index + 1,
      });
    }
    const sameIndex = this.stack.findIndex((existing) =>
      item.checkIsSame(existing),
    );
    if (sameIndex >= 0) {
      return this.change({ index: sameIndex });
    }
    return ItemHistory.initial(item);
  }
}
