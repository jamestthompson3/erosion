export function emitter() {
  const listeners = new Map();
  return {
    on(event, cb) {
      const callbacks = listeners.get(event);
      if (!callbacks) {
        listeners.set(event, new Set([cb]));
      } else {
        callbacks.add(cb);
      }
    },
    emit(event, ...args) {
      if (listeners.has(event)) {
        Array.from(listeners.get(event)).map(cb => {
          cb(...args);
        });
      }
    },
    remove(event, cb) {
      if (listeners.has(event)) {
        listeners.get(event).delete(cb);
      }
    },
    drain() {
      for (const key of listeners.keys()) {
        listeners.delete(key);
      }
    }
  };
}

export const messages = {
  WorkspaceInit: "WorkspaceInit",
  UpdateCard: "UpdateCard"
};

// TODO later maybe refactor out tauri vs REST API
export function globalEmitter() {
  const tauri = window.__TAURI__;
  const { event } = tauri;
  return {
    on(e, cb) {
      event.listen(e, ({ payload }) => {
        cb(payload);
      });
    },
    emit(e, ...args) {
      event.emit(e, JSON.stringify(...args));
    }
  };
}

export const global = globalEmitter();
