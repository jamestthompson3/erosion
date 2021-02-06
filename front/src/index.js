import App from "./components/App.js";
import {
  contextEmitter,
  kby,
  postData,
  inboxKby,
  messages,
  appContext,
  appSettings,
  listenFor,
} from "./messages.js";

import {
  updateCard,
  removeCard,
  removeProject,
  moveCard,
  removeInbox,
} from "./utils/lenses";

(function () {
  listenFor(messages.WorkspaceInit, (payload) => {
    const { state, settings } = payload;
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
  listenFor(messages.StateUpdated, (newState) => {
    const state = newState;
    const cardKeyed = kby(state.projects);
    const inboxKeyed = inboxKby(state.projects);
    appContext.set("state", state);
    appContext.set("cardKeyed", cardKeyed);
    appContext.set("inboxKeyed", inboxKeyed);
  });

  contextEmitter.on(messages.UpdateCard, (updatePayload) => {
    updateCard(updatePayload);
  });
  contextEmitter.on(messages.DeleteCard, (updatePayload) => {
    removeCard(updatePayload);
  });
  contextEmitter.on(messages.DeleteInbox, (updatePayload) => {
    removeInbox(updatePayload);
  });

  contextEmitter.on(messages.DeleteProject, (updatePayload) => {
    removeProject(updatePayload);
  });
  contextEmitter.on(messages.MoveCard, (updatePayload) => {
    moveCard(updatePayload);
  });
  const tauri = window.__TAURI__;
  if (!tauri) {
    postData(messages.WorkspaceInit, "WorkspaceInit");
  }

  new App();
})();
