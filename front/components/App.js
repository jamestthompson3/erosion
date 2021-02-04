import Project from "./Project.js";
import Component from "./Component.js";
import Cancel from "./icons/Cancel.js";
import Check from "./icons/Check.js";
import WorkspaceSidebar from "./WorkspaceSidebar.js";
import {
  listenFor,
  messages,
  contextEmitter,
  postData,
  appContext,
  newProjectEmitter,
  kby
} from "../messages.js";

import {
  findInbox,
  findProject,
  findCard,
  updateInboxCards,
  updateProjectInboxes,
  updateStateProjects
} from "../utils/lenses.js";

export default class App extends Component {
  constructor() {
    super(document.body);
    this.state = {};
    // splash screen
    document.body.innerHTML = `
      <div class="splashscreen">
        <img src="/media/erosion.png" />
      </div>
    `;
    listenFor(messages.StateUpdated, payload => this.globalUpdated(payload));
    listenFor(
      messages.UpdateSettings,
      () => (window.location = window.location)
    );
    contextEmitter.on(messages.WorkspaceReady, () => {
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
      contextEmitter.on(messages.DeleteInbox, updatePayload => {
        this.removeInbox(updatePayload);
      });

      contextEmitter.on(messages.DeleteProject, updatePayload => {
        this.removeProject(updatePayload);
      });
      contextEmitter.on(messages.MoveCard, updatePayload => {
        this.moveCard(updatePayload);
      });
      this.setState(state);
    });
  }
  update() {
    this.sweepAndUpdate();
  }
  moveCard({ card_id, instructions: { inbox, project } }) {
    const srcProject = findProject(project.src, this.state);
    const destProject = findProject(project.dest, this.state);
    const srcInbx = findInbox(inbox.src, srcProject);
    const destInbx = findInbox(inbox.dest, destProject);
    const foundCard = findCard(card_id, srcInbx);
    const updatedInbox = {
      ...srcInbx,
      cards: srcInbx.cards.filter(c => c.id !== card_id)
    };
    const updatedDest = {
      ...destInbx,
      cards: destInbx.cards.concat(foundCard)
    };
    if (project.src === project.dest) {
      const updatedProject = updateProjectInboxes(
        updateProjectInboxes(srcProject, updatedInbox),
        updatedDest
      );
      const updatedState = updateStateProjects(this.state, updatedProject);
      const cardKeyed = kby(updatedState.projects);
      appContext.set("cardKeyed", cardKeyed);
      this.setState(updatedState);
    } else {
      const updatedSrc = updateProjectInboxes(srcProject, srcInbx);
      const updatedDest = updateProjectInboxes(destProject, destInbx);
      const updatedState = updateStateProjects(
        this.state,
        updateStateProjects(this.state, updatedSrc),
        updatedDest
      );
      const cardKeyed = kby(updatedState.projects);
      appContext.set("cardKeyed", cardKeyed);
      this.setState(updatedState);
    }
  }
  sweepAndUpdate() {
    const workspaceContainer = document.body.querySelector(
      ".workspace.projects"
    );
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
  removeInbox(updatePayload) {
    const { project, inbox } = updatePayload;
    const foundProject = findProject(project, this.state);
    const updatedState = updateStateProjects(this.state, {
      ...foundProject,
      inboxes: foundProject.inboxes.filter(box => box.id !== inbox)
    });
    this.setState(updatedState);
  }
  removeProject(updatePayload) {
    const { project_id } = updatePayload;
    this.setState({
      ...this.state,
      projects: this.state.projects.filter(p => p.id !== project_id)
    });
  }
  globalUpdated(newState) {
    this.setState(newState);
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
    newProjectEmitter.on("TOGGLE", () => {
      if (this.state.current === "VIEW") {
        this.setState({ current: "ADD_PROJECT" });
      } else {
        this.setState({ current: "VIEW" });
      }
    });
  }
  save = () => {
    const projectName = this.el.querySelector(".project.new-project-name");
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
      this.el.innerHTML = ``;
    }
    if (current === "ADD_PROJECT") {
      this.el.innerHTML = `
        <input placeholder="project name" class="project new-project-name" type="text"></inbox>
        <button class="project-form accept" title="save project">${Check()}</button>
        <button class="project-form cancel" title="cancel creation">${Cancel()}</button>
        `;
      const input = this.el.querySelector("input");
      input.focus();
      const save = this.el.querySelector(".project-form.accept");
      const cancel = this.el.querySelector(".project-form.cancel");
      save.addEventListener("click", this.save);
      cancel.addEventListener("click", () => {
        this.setState({ current: "VIEW" });
      });
    }
  }
}
