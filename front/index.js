import Project from "./components/Project.js";
import { global, messages } from "./m.js";

(function() {
  const tauri = window.__TAURI__;
  const { fs } = tauri;
  global.on(messages.WorkspaceInit, payload => {
    fs.readTextFile(payload).then(text => {
      const state = JSON.parse(text);
      state.projects.forEach(project => {
        new Project(project);
      });
    });
  });
})();
