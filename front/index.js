import Project from "./components/Project.js";
import { globalEmitter, messages } from "./m.js";

(function() {
  const tauri = window.__TAURI__;
  const { fs } = tauri;
  const global = globalEmitter();
  global.on(messages.WorkspaceInit, payload => {
    fs.readTextFile(payload).then(text => {
      const state = JSON.parse(text);
      state.projects.forEach(project => {
        new Project(project);
      });
    });
  });
})();
