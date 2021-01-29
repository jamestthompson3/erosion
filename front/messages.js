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
  CreateCard: "CreateCard",
  CreateInbox: "CreateInbox",
  CreateProject: "CreateProject",
  DeleteCard: "DeleteCard",
  DeleteInbox: "DeleteInbox",
  DeleteProject: "DeleteProject",
  UpdateSettings: "UpdateSettings",
  StateUpdated: "StateUpdated",
  UpdateCard: "UpdateCard",
  UpdateInbox: "UpdateInbox",
  UpdateProject: "UpdateProject",
  WorkspaceInit: "WorkspaceInit",
  WorkspaceReady: "WorkspaceReady"
};

export function kby(projects) {
  let keyedByCard = {};
  // for some reason, .reduce doesn't work on the Linux webkit...
  for (const project of projects) {
    const inboxMap = inboxReducer(project.id)(project.inboxes);
    Object.assign(keyedByCard, inboxMap);
  }
  return keyedByCard;
}

function inboxReducer(projectId) {
  return function(inboxes) {
    const map = {};
    for (const inbox of inboxes) {
      for (const card of inbox.cards) {
        if (!map[card.id]) {
          map[card.id] = { inbox: inbox.id, project: projectId };
        }
      }
    }
    return map;
  };
}

export function inboxKby(projects) {
  const keyedBy = {};
  for (const project of projects) {
    for (const inbox of project.inboxes) {
      keyedBy[inbox.id] = { project: project.id };
    }
  }
  return keyedBy;
}

// FIXME don't really like this too much, it relies on execution order of the app
export const appContext = new Map();
export const appSettings = new Map();
export const contextEmitter = emitter();

export function globalEmitter() {
  const tauri = window.__TAURI__;
  if (tauri) {
    const { event } = tauri;
    return {
      on(e, cb) {
        event.listen(e, ({ payload }) => {
          cb(payload);
        });
      },
      emit(e, ...args) {
        event.emit(e, JSON.stringify(...args));
        contextEmitter.emit(e, ...args);
      }
    };
  }
  const listeners = new Map();
  return {
    on(e, cb) {
      const callbacks = listeners.get(e);
      if (!callbacks) {
        listeners.set(e, new Set([cb]));
      } else {
        callbacks.add(cb);
      }
    },
    emit(e, ...args) {
      // We can do this because we're getting the whole state back on create calls
      const eventLabel = e.includes("Create") ? messages.StateUpdated : e;
      const promise = fetch("/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: constructBody(e, args)
      });
      contextEmitter.emit(eventLabel, ...args);
      if (listeners.has(eventLabel)) {
        promise
          .then(r => r.json())
          .then(result => {
            Array.from(listeners.get(eventLabel)).map(cb => {
              cb(result);
            });
          })
          .catch(console.error);
      }
    }
  };
}

function constructBody(e, args) {
  if (args.length === 1 && typeof args[0] === "string") {
    return `{ "event": ${JSON.stringify(...args)} }`;
  }
  return `{ "event": {"${e}": ${JSON.stringify(...args)}}}`;
}

const globalEvents = globalEmitter();
export const newProjectEmitter = emitter();

export const postData = globalEvents.emit;
export const listenFor = globalEvents.on;
