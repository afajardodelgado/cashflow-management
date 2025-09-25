// Simple localStorage polyfill for Node test environment
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map()
  globalThis.localStorage = {
    getItem(key) {
      const v = store.get(String(key))
      return v === undefined ? null : v
    },
    setItem(key, value) {
      store.set(String(key), String(value))
    },
    removeItem(key) {
      store.delete(String(key))
    },
    clear() {
      store.clear()
    },
    key(i) {
      return Array.from(store.keys())[i] ?? null
    },
    get length() {
      return store.size
    }
  }
}
