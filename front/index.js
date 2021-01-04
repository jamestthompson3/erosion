import Project from "./components/Project.js";

(function() {
  const tauri = window.__TAURI__;
  const { event, fs } = tauri;
  event.listen("WorkspaceInit", ({ payload }) => {
    fs.readTextFile(payload).then(text => {
      const state = JSON.parse(text);
      state.projects.forEach(project => {
        new Project(project);
      });
    });
  });
})();
