export type CustomMapHasher<K, H> = (item: K) => H;

export class CustomMapIndex<K, V, H> {
  map: CustomMap<K, V, H>;
  hash: H;
  key: K;

  constructor(map: CustomMap<K, V, H>, hash: H, key: K) {
    this.map = map;
    this.hash = hash;
    this.key = key;
  }

  has(): boolean {
    return this.map.has(this);
  }

  get(): V | undefined {
    return this.map.get(this);
  }

  set(value: V) {
    this.map.set(this, value);
  }
}

export class CustomMap<K, V, H> {
  hasher: CustomMapHasher<K, H>;
  innerMap: Map<H, [K, V]>;

  static makeType<K, H>(hasher: CustomMapHasher<K, H>) {
    return CustomMapWithHasher.makeType(hasher);
  }

  constructor(
    entriesOrMap: CustomMap<K, V, H> | [K, V][] | null | undefined,
    hasher: CustomMapHasher<K, H>,
  ) {
    this.hasher = hasher;
    this.innerMap = new Map();
    if (entriesOrMap) {
      this.add(entriesOrMap);
    }
  }

  add(entriesOrMap?: CustomMap<K, V, H> | [K, V][]) {
    if (!entriesOrMap) {
      return this;
    }
    if (Array.isArray(entriesOrMap)) {
      for (const [key, value] of entriesOrMap) {
        this.set(key, value);
      }
    } else {
      for (const [key, value] of entriesOrMap.entries()) {
        this.set(key, value);
      }
    }
    return this;
  }

  entries(): Iterable<[K, V]> {
    return this.innerMap.values();
  }

  *values(): Iterable<V> {
    for (const [, value] of this.innerMap.values()) {
      yield value;
    }
  }

  getIndex(item: K): CustomMapIndex<K, V, H> {
    return new CustomMapIndex(this, this.hasher(item), item);
  }

  has(itemOrIndex: K | CustomMapIndex<K, V, H>): boolean {
    let hash: H;
    if (itemOrIndex instanceof CustomMapIndex) {
      hash = itemOrIndex.hash;
    } else {
      hash = this.hasher(itemOrIndex);
    }
    return this.innerMap.has(hash);
  }

  get(itemOrIndex: K | CustomMapIndex<K, V, H>): V | undefined {
    let hash: H;
    if (itemOrIndex instanceof CustomMapIndex) {
      hash = itemOrIndex.hash;
    } else {
      hash = this.hasher(itemOrIndex);
    }
    const entry = this.innerMap.get(hash);
    return entry?.[1];
  }

  set(itemOrIndex: K | CustomMapIndex<K, V, H>, value: V) {
    let hash: H;
    let key: K;
    if (itemOrIndex instanceof CustomMapIndex) {
      hash = itemOrIndex.hash;
      key = itemOrIndex.key;
    } else {
      hash = this.hasher(itemOrIndex);
      key = itemOrIndex;
    }
    this.innerMap.set(hash, [key, value]);
  }

  setNew(key: K, value: V): boolean {
    if (this.has(key)) {
      return false;
    }
    this.set(key, value);
    return true;
  }

  get size(): number {
    return this.innerMap.size;
  }
}

export class CustomMapWithHasher<V, K, H> extends CustomMap<K, V, H> {
  static hasher: CustomMapHasher<any, any>;
  static compareFn: <K>(a: K, b: K) => number;

  static makeCompareFn() {
    return <K>(a: K, b: K): number => {
      const aHash = this.hasher(a);
      const bHash = this.hasher(b);
      if (aHash < bHash) {
        return -1;
      } else if (aHash === bHash) {
        return 0;
      } else {
        return 1;
      }
    };
  }

  static sort<K>(multiplePositionArray: K[]): K[] {
    return multiplePositionArray.sort(this.compareFn);
  }

  static deserialise<K, V>(
    serialised: [K, V][],
  ): CustomMapWithHasher<V, K, any> {
    return new this(serialised, this.hasher);
  }

  static makeType<K, H>(hasher: CustomMapHasher<K, H>) {
    return class CustomMapWithSpecificHasher<V> extends this<V, K, H> {
      static hasher = hasher;
      static compareFn = this.makeCompareFn();

      constructor(entriesOrMap?: CustomMap<K, V, H> | [K, V][]) {
        super(entriesOrMap, hasher);
      }
    };
  }

  constructor(
    entriesOrMap?: CustomMap<K, V, H> | [K, V][],
    hasher?: CustomMapHasher<K, H>,
  ) {
    if (!hasher) {
      throw new Error("Hasher must be provided");
    }
    super(entriesOrMap, hasher);
  }

  serialise(): [K, V][] {
    return Array.from(this.entries());
  }
}
