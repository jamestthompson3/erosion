import App from "./components/App.js";
import {
  contextEmitter,
  kby,
  postData,
  inboxKby,
  messages,
  appContext,
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
  const tauri = window.__TAURI__;
  if (!tauri) {
    postData(messages.WorkspaceInit, "WorkspaceInit");
  }
  contextEmitter.on(messages.WorkspaceInit, payload => {
    const state = JSON.parse(payload);
    const cardKeyed = kby(state.projects);
    const inboxKeyed = inboxKby(state.projects);
    appContext.set("state", state);
    appContext.set("cardKeyed", cardKeyed);
    appContext.set("inboxKeyed", inboxKeyed);
    contextEmitter.emit(messages.WorkspaceReady);
  });
  listenFor(messages.StateUpdated, newState => {
    const state = JSON.parse(newState);
    const cardKeyed = kby(state.projects);
    const inboxKeyed = inboxKby(state.projects);
    appContext.set("state", state);
    appContext.set("cardKeyed", cardKeyed);
    appContext.set("inboxKeyed", inboxKeyed);
  });

  new App();
})();
