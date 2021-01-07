import Project from "./components/Project.js";
import { global, messages, contextEmitter, appContext } from "./messages.js";

/*
 * Basically 2 things here:
 * 1: the activity state of the application (has the initial payload been sent, are we in the middle of the update, etc.)
 * 2: the data layer.
 */
(function() {
  global.on(messages.WorkspaceInit, payload => {
    contextEmitter.emit(messages.WorkspaceInit, payload);
  });
  contextEmitter.on(messages.WorkspaceReady, () => {
    const state = appContext.get("state");
    state.projects.forEach(project => {
      new Project(project);
    });
  });
})();
