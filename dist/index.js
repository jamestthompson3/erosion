(function() {
  const tauri = window.__TAURI__;
  const { event, fs } = tauri;
  event.listen("WorkspaceInit", ({ payload }) => {
    fs.readTextFile(payload).then(text => {
      const state = JSON.parse(text);
      console.log(state);
      state.projects.forEach(project => {
        const projectTitle = document.createElement("h1");
        projectTitle.innerText = project.name;
        document.body.appendChild(projectTitle);
      });
    });
  });
})();
