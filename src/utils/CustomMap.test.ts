import { CustomMap, CustomMapHasher, CustomMapWithHasher } from "./CustomMap";

function makeTestSuite<K, V, H>(
  makeCustomMap: <K, V, H>(
    hasher: (key: K) => H,
    entriesOrMap?: CustomMap<K, V, H> | [K, V][],
  ) => CustomMap<K, V, H>,
) {
  type KeyType = { x: number; y: number };
  const hasher = (key: KeyType) => `${key.x},${key.y}`;
  describe("get and set", () => {
    it("gets and sets with the same object correctly", () => {
      const customMap = makeCustomMap<KeyType, string, string>(hasher);

      const key1: KeyType = { x: 1, y: 2 };
      const key2: KeyType = { x: 3, y: 4 };

      customMap.set(key1, "value1");
      customMap.set(key2, "value2");

      expect(customMap.get(key1)).toBe("value1");
      expect(customMap.get(key2)).toBe("value2");
    });
    it("gets and sets with a different object correctly", () => {
      const customMap = makeCustomMap<KeyType, string, string>(hasher);

      customMap.set({ x: 1, y: 2 }, "value1");
      customMap.set({ x: 3, y: 4 }, "value2");

      expect(customMap.get({ x: 1, y: 2 })).toBe("value1");
      expect(customMap.get({ x: 3, y: 4 })).toBe("value2");
    });
  });
  describe("entries and values", () => {
    it("iterates all entries correctly", () => {
      const customMap = makeCustomMap<KeyType, string, string>(hasher);

      const entries: [KeyType, string][] = [
        [{ x: 1, y: 2 }, "value1"],
        [{ x: 3, y: 4 }, "value2"],
        [{ x: 5, y: 6 }, "value3"],
      ];

      for (const [key, value] of entries) {
        customMap.set(key, value);
      }

      expect(Array.from(customMap.entries()).length).toEqual(entries.length);
      expect(Array.from(customMap.values()).length).toEqual(entries.length);
    });
  });
  describe("CustomMapIndex", () => {
    it("gets and sets values using CustomMapIndex", () => {
      const customMap = makeCustomMap<KeyType, string, string>(hasher);

      const key1: KeyType = { x: 1, y: 2 };
      const key2: KeyType = { x: 3, y: 4 };

      customMap.set(key1, "value1");
      customMap.set(key2, "value2");

      const index1 = customMap.getIndex(key1);
      const index2 = customMap.getIndex(key2);

      expect(customMap.get(index1)).toBe("value1");
      expect(customMap.get(index2)).toBe("value2");

      customMap.set(index1, "newValue1");
      expect(customMap.get(key1)).toBe("newValue1");
    });
  });
}
describe("CustomMap", () => {
  describe("with no subclassing", () => {
    makeTestSuite((hasher, entriesOrMap) => {
      return new CustomMap(entriesOrMap, hasher);
    });
  });
  describe("with makeType subclassing", () => {
    const customTypeMap = new Map();
    function makeType<K, H>(
      hasher: CustomMapHasher<K, H>,
    ): typeof CustomMapWithHasher<any, K, H> {
      if (!customTypeMap.has(hasher)) {
        const CustomMapType = CustomMap.makeType(hasher);
        customTypeMap.set(hasher, CustomMapType);
      }
      return customTypeMap.get(hasher);
    }
    makeTestSuite((hasher, entriesOrMap) => {
      const CustomMapType = makeType(hasher);
      return new CustomMapType(entriesOrMap);
    });
    describe("sort", () => {
      type KeyType = { x: number; y: number };
      const hasher = (key: KeyType) => `${key.x},${key.y}`;
      const CustomMapType = makeType<KeyType, string>(hasher);
      it("sorts correctly", () => {
        const unsortedArrayA: KeyType[] = [
          { x: 2, y: 3 },
          { x: 1, y: 2 },
          { x: 3, y: 1 },
        ];
        const unsortedArrayB = unsortedArrayA.slice().reverse();
        expect(CustomMapType.sort(unsortedArrayA)).toEqual(
          CustomMapType.sort(unsortedArrayB),
        );
      });
    });
    describe("deserialise and serialise", () => {
      type KeyType = { x: number; y: number };
      const hasher = (key: KeyType) => `${key.x},${key.y}`;
      const CustomMapType = makeType<KeyType, string>(hasher);
      it("deserialises and serialises correctly", () => {
        const originalEntries: [KeyType, string][] = [
          [{ x: 1, y: 2 }, "value1"],
          [{ x: 3, y: 4 }, "value2"],
        ];
        const customMap = new CustomMapType(originalEntries);
        const serialised = customMap.serialise();
        const deserialisedMap = CustomMapType.deserialise(serialised);
        expect(Array.from(deserialisedMap.entries())).toEqual(
          Array.from(customMap.entries()),
        );
      });
    });
  });
});
