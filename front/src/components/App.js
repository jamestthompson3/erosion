import { appContext, contextEmitter, listenFor, messages } from "../messages";

import Component from "./Component";
import NewProjectForm from "./NewProjectForm";
import Project from "./Project";
import WorkspaceSidebar from "./WorkspaceSidebar";

export default class App extends Component {
  constructor() {
    super(document.body);
    // splash screen
    document.body.innerHTML = `
      <div class="splashscreen">
        <img src="/media/erosion.png" />
      </div>
    `;
    const projects = appContext.select("state.projects");
    projects.on("update", "*", this.sweepAndUpdate);
    listenFor(
      messages.UpdateSettings,
      () => (window.location = window.location)
    );
    contextEmitter.on("WorkspaceReady", () => {
      document.body.innerHTML = `
      <aside class="workspace sidebar"></aside>
      <div class="workspace container">
      <div class="workspace projects">
        <div class="project project-form"></div>
      </div>
     </div>
    `;
      const createProjectForm = document.body.querySelector(
        ".project.project-form"
      );
      const sidebar = document.body.querySelector(".workspace.sidebar");
      const workspaceContainer = document.body.querySelector(
        ".workspace.projects"
      );
      new WorkspaceSidebar(sidebar, {});
      new NewProjectForm(createProjectForm, {});
      const state = appContext.get("state");
      state.projects.forEach((project) => {
        const projectContainer = document.createElement("div");
        projectContainer.classList.add("project", "container");
        projectContainer.dataset.id = project.id;
        workspaceContainer.appendChild(projectContainer);
        new Project(projectContainer, project);
      });
      appContext.on("update", "state", this.sweepAndUpdate);
    });
  }
  sweepAndUpdate() {
    const projects = appContext.get("state.projects");
    const workspaceContainer = document.body.querySelector(
      ".workspace.projects"
    );
    const children = workspaceContainer.querySelectorAll(".project.container");
    // create a map here so we can quickly look up if the child exists by using the cardId
    const childrenById = new Map();
    const markedToRemove = new Set(children);
    markedToRemove.forEach((child) => {
      childrenById.set(child.dataset.key, child);
    });
    projects.forEach((project) => {
      const childToUpdate = childrenById.get(project.id);
      if (childToUpdate) {
        markedToRemove.delete(childToUpdate);
        childToUpdate.withProps(project);
      } else {
        const projectContainer = document.createElement("div");
        projectContainer.classList.add("project", "container");
        projectContainer.dataset.key = project.id;
        workspaceContainer.appendChild(projectContainer);
        new Project(projectContainer, project);
      }
    });
    markedToRemove.forEach((oldNode) => {
      workspaceContainer.removeChild(oldNode);
    });
  }
  globalUpdated(newState) {
    appContext.set("state", newState);
  }
}
