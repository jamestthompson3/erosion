import Project from "./Project.js";
import Component from "./Component.js";
import NewProject from "./icons/NewProject.js";
import Cancel from "./icons/Cancel.js";
import Check from "./icons/Check.js";
import WorkspaceSidebar from "./WorkspaceSidebar.js";
import {
  listenFor,
  messages,
  contextEmitter,
  postData,
  appContext
} from "../messages.js";

import {
  findInbox,
  findProject,
  updateInboxCards,
  updateProjectInboxes,
  updateStateProjects
} from "../utils/lenses.js";

export default class App extends Component {
  constructor() {
    super(document.body);
    this.state = {};
    document.body.innerHTML = `
     <div class="workspace container">
      <aside class="workspace sidebar"></aside>
      <div class="workspace projects">
        <div class="project project-form"></div>
      </div>
      <div class="workspace spacer"></div>
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
    listenFor(messages.WorkspaceInit, payload => {
      contextEmitter.emit(messages.WorkspaceInit, payload);
    });
    listenFor(messages.StateUpdated, payload => this.globalUpdated(payload));
    contextEmitter.on(messages.WorkspaceReady, () => {
      const state = appContext.get("state");
      state.projects.forEach(project => {
        const projectContainer = document.createElement("div");
        projectContainer.classList.add("project", "container");
        projectContainer.dataset.id = project.id;
        workspaceContainer.appendChild(projectContainer);
        new Project(projectContainer, project);
      });
      contextEmitter.on(messages.UpdateCard, updatePayload => {
        this.updateCard(updatePayload);
      });
      contextEmitter.on(messages.DeleteCard, updatePayload => {
        this.removeCard(updatePayload);
      });
      this.setState(state);
    });
  }
  update() {
    this.sweepAndUpdate();
  }
  sweepAndUpdate() {
    const workspaceContainer = document.body.querySelector(
      ".workspace.projects"
    );
    console.log(workspaceContainer);
    const { projects } = this.state;
    const children = workspaceContainer.querySelectorAll(".project.container");
    // create a map here so we can quickly look up if the child exists by using the cardId
    const childrenById = new Map();
    const markedToRemove = new Set(children);
    markedToRemove.forEach(child => {
      childrenById.set(child.dataset.key, child);
    });
    projects.forEach(project => {
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
    markedToRemove.forEach(oldNode => {
      workspaceContainer.removeChild(oldNode);
    });
  }
  updateCard(updatePayload) {
    const { project, inbox, card } = updatePayload;
    const foundProject = findProject(project, this.state);
    const foundInbox = findInbox(inbox, foundProject);
    this.setState(
      updateStateProjects(
        this.state,
        updateProjectInboxes(foundProject, updateInboxCards(foundInbox, card))
      )
    );
  }
  globalUpdated(newState) {
    this.setState(JSON.parse(newState));
  }
  removeCard(updatePayload) {
    const { project, inbox, card } = updatePayload;
    const foundProject = findProject(project, this.state);
    const foundInbox = findInbox(inbox, foundProject);
    const updatedState = updateStateProjects(
      this.state,
      updateProjectInboxes(foundProject, {
        ...foundInbox,
        cards: foundInbox.cards.filter(c => c.id !== card)
      })
    );
    this.setState(updatedState);
  }
}

class NewProjectForm extends Component {
  constructor(el, props) {
    super(el, props);
    this.state = {
      current: "VIEW"
    };
    el.innerHTML = `
        <button aria-label="add project" title="add project to workspace" class="project add-project">${NewProject()}</button>
    `;
    const addButton = el.querySelector(".project.add-project");
    addButton.addEventListener("click", () => {
      this.setState({ current: "ADD_PROJECT" });
    });
  }
  save = () => {
    const projectName = this.parent.querySelector(".project.new-project-name");
    if (projectName.value !== "") {
      postData(messages.CreateProject, {
        name: projectName.value.trim()
      });
      this.setState({ current: "VIEW" });
    }
  };
  update() {
    const { current } = this.state;
    if (current === "VIEW") {
      this.parent.innerHTML = `
        <button aria-label="add project" title="add project to workspace" class="project add-project">${NewProject()}</button>
      `;
      const addButton = this.parent.querySelector(".project.add-project");
      addButton.addEventListener("click", () => {
        this.setState({ current: "ADD_PROJECT" });
      });
    }
    if (current === "ADD_PROJECT") {
      this.parent.innerHTML = `
        <input placeholder="project name" class="project new-project-name" type="text"></inbox>
        <button class="project-form accept" title="save project">${Check()}</button>
        <button class="project-form cancel" title="cancel creation">${Cancel()}</button>
        `;
      const input = this.parent.querySelector("input");
      input.focus();
      const save = this.parent.querySelector(".project-form.accept");
      const cancel = this.parent.querySelector(".project-form.cancel");
      save.addEventListener("click", this.save);
      cancel.addEventListener("click", () => {
        this.setState({ current: "VIEW" });
      });
    }
  }
}
