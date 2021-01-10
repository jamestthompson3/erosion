import Project from "./Project.js";
import Component from "./Component.js";
import {
  listenFor,
  messages,
  contextEmitter,
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
        document.body.appendChild(projectContainer);
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
    const { projects } = this.state;
    const children = this.parent.querySelectorAll(".project.container");
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
        this.parent.appendChild(projectContainer);
        new Project(projectContainer, project);
      }
    });
    markedToRemove.forEach(oldNode => {
      this.parent.removeChild(oldNode);
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
