import {
  DeleteCardPayload,
  DeleteInboxPayload,
  DeleteProjectPayload,
  MoveCardPayload,
  State,
  UpdateCardPayload,
  WorkspaceInitPayload,
} from "./types";
import {
  appContext,
  appSettings,
  contextEmitter,
  inboxKby,
  kby,
  listenFor,
  messages,
  postData,
} from "./messages";
import {
  moveCard,
  removeCard,
  removeInbox,
  removeProject,
  updateCard,
} from "./utils/lenses";

import App from "./components/App";

(function () {
  listenFor(messages.WorkspaceInit, (payload: WorkspaceInitPayload) => {
    const { state, settings } = payload;
    const cardKeyed = kby(state.projects);
    const inboxKeyed = inboxKby(state.projects);
    appContext.set("state", state);
    appContext.set("cardKeyed", cardKeyed);
    appContext.set("inboxKeyed", inboxKeyed);
    for (const [key, value] of Object.entries(settings)) {
      appSettings.set(key, value);
    }
    contextEmitter.emit(messages.WorkspaceReady);
  });
  listenFor(messages.StateUpdated, (newState: State) => {
    const state = newState;
    const cardKeyed = kby(state.projects);
    const inboxKeyed = inboxKby(state.projects);
    appContext.set("state", state);
    appContext.set("cardKeyed", cardKeyed);
    appContext.set("inboxKeyed", inboxKeyed);
  });

  contextEmitter.on(messages.UpdateCard, (updatePayload: UpdateCardPayload) => {
    updateCard(updatePayload);
  });
  contextEmitter.on(messages.DeleteCard, (updatePayload: DeleteCardPayload) => {
    removeCard(updatePayload);
  });
  contextEmitter.on(
    messages.DeleteInbox,
    (updatePayload: DeleteInboxPayload) => {
      removeInbox(updatePayload);
    }
  );

  contextEmitter.on(
    messages.DeleteProject,
    (updatePayload: DeleteProjectPayload) => {
      removeProject(updatePayload);
    }
  );
  contextEmitter.on(messages.MoveCard, (updatePayload: MoveCardPayload) => {
    moveCard(updatePayload);
  });
  postData(messages.WorkspaceInit, "WorkspaceInit");

  new App();
})();
