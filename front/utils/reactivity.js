import { isEqual } from "./lang.js";

export function observableStore() {
  const store = new Map();
  const handler = {
    get: function(target, prop) {
      console.log("G<---", target, prop);
      return Reflect.get(...arguments);
    },
    set: function(_, prop, value) {
      console.log(`   ===>S`, prop, value);
      return Reflect.set(...arguments);
    }
  };
  const proxied = new Proxy(store, handler);
  return proxied;
}

const a = {
  id: "1234",
  inboxes: [
    { id: "345a", name: "test", cards: [{ id: "43a", status: "InProgress" }] }
  ]
};

const b = {
  id: "1234",
  inboxes: [
    {
      id: "345a",
      name: "test",
      cards: [{ id: "43a", status: "ToDo" }]
    }
  ]
};

console.log(isEqual(a, b));

/*
 *
 * const store = observableStore()
 * store.observe(lens, observer)
 * store.dispatch(value)
 *
 */
