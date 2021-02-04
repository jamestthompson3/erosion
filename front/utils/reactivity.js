import { isEqual } from "./lang.js";

/**
 * @typedef { import("./types").StoreEvents } StoreEvents
 */

export function observableStore(initialValues = {}) {
  const store = new Map(Object.entries(initialValues));
  const updateListeners = new Map();
  const accessListeners = new Map();
  const handler = {
    get: function (prop) {
      if (accessListeners.has(prop)) accessListeners.get(prop)();
      return Reflect.get(...arguments);
    },
    set: function (_, prop, value) {
      Reflect.set(...arguments);
      if (updateListeners.has(prop)) updateListeners.get(prop)(value);
    },
  };
  const proxied = new Proxy(store, handler);
  return {
    set(key, value) {
      proxied[key] = value;
    },
    /**
     * @param key {string}
     * @param event {StoreEvents}
     * @param cb {fn(): void}
     */
    on(key, event, cb) {
      if (event === "update") {
        updateListeners.set(key, cb);
      }
      if (event === "access") {
        accessListeners.set(key, cb);
      }
    },
    // TODO make this return sub stores
    get(key) {
      return proxied[key];
    },
  };
}

const a = {
  id: "1234",
  inboxes: [
    { id: "345a", name: "test", cards: [{ id: "43a", status: "InProgress" }] },
  ],
};

const b = {
  id: "1234",
  inboxes: [
    {
      id: "345a",
      name: "test",
      cards: [{ id: "43a", status: "ToDo" }],
    },
  ],
};

console.log(isEqual(a, b));

/*
 *
 * const store = observableStore()
 * store.observe(lens, observer)
 * store.dispatch(value)
 *
 */
