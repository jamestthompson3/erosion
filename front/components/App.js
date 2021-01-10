import Project from "./Project.js";
import Component from "./Component.js";
import {
  listenFor,
  messages,
  contextEmitter,
  appContext
} from "../messages.js";

export default class App extends Component {
  constructor() {
    super(document.body);
    this.state = {};
    listenFor(messages.WorkspaceInit, payload => {
      contextEmitter.emit(messages.WorkspaceInit, payload);
    });
    contextEmitter.on(messages.WorkspaceReady, () => {
      const state = appContext.get("state");
      state.projects.forEach(project => {
        const projectContainer = document.createElement("div");
        projectContainer.classList.add("project", "container");
        projectContainer.dataset.id = project.id;
        document.body.appendChild(projectContainer);
        new Project(projectContainer, project);
      });
      this.setState(state);
    });
  }
  update() {
    this.sweepAndUpdate(".project.container", this.state.projects, Project);
  }
}
