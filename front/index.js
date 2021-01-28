import App from "./components/App.js";
import {
  contextEmitter,
  kby,
  postData,
  inboxKby,
  messages,
  appContext,
  appSettings,
  listenFor
} from "./messages.js";
/*
 * Basically 2 things here:
 * 1: the activity state of the application (has the initial payload been sent, are we in the middle of the update, etc.)
 * 2: the data layer.
 */

/*
 * Data update scenarios:
 *   - Component recieves new props (re-rendered by parent)
 *   - Component updates some internal state
 * Part of the issue is that these components are not pure, or at least do not have some sort of output.
 */
(function() {
  listenFor(messages.WorkspaceInit, payload => {
    const { state, settings } = payload;
    console.log({ state, settings });
    const cardKeyed = kby(state.projects);
    const inboxKeyed = inboxKby(state.projects);
    appContext.set("state", state);
    appContext.set("cardKeyed", cardKeyed);
    appContext.set("inboxKeyed", inboxKeyed);
    for ([key, value] of Object.entries(settings)) {
      appSettings.set(key, value);
    }
    contextEmitter.emit(messages.WorkspaceReady);
  });
  listenFor(messages.StateUpdated, newState => {
    const state = newState;
    const cardKeyed = kby(state.projects);
    const inboxKeyed = inboxKby(state.projects);
    appContext.set("state", state);
    appContext.set("cardKeyed", cardKeyed);
    appContext.set("inboxKeyed", inboxKeyed);
  });
  const tauri = window.__TAURI__;
  if (!tauri) {
    postData(messages.WorkspaceInit, "WorkspaceInit");
  }

  new App();
})();
