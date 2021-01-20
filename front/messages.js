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
  WorkspaceReady: "WorkspaceReady",
  UpdateCard: "UpdateCard",
  CreateCard: "CreateCard",
  StateUpdated: "StateUpdated",
  DeleteCard: "DeleteCard",
  UpdateInbox: "UpdateInbox",
  CreateInbox: "CreateInbox",
  CreateProject: "CreateProject",
  UpdateProject: "UpdateProject"
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
export const contextEmitter = emitter();
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
      contextEmitter.emit(e, ...args);
    }
  };
}

const globalEvents = globalEmitter();
export const newProjectEmitter = emitter();

export const postData = globalEvents.emit;
export const listenFor = globalEvents.on;
