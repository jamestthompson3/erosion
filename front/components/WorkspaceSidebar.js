import Component from "./Component.js";
import NewProject from "./icons/NewProject.js";
import Settings from "./icons/Settings.js";
import { newProjectEmitter } from "../messages.js";

export default class WorkspaceSidebar extends Component {
  constructor(el, props) {
    super(el, props);
    this.el.innerHTML = `
      <button aria-label="add project" title="add project to workspace" class="workspace add-project">${NewProject()}</button>
      <button aria-label="edit settings" title="edit settings" class="workspace edit-settings">${Settings()}</button>
    `;
    const newProjectButton = this.el.querySelector("button");
    newProjectButton.addEventListener("click", () => {
      newProjectEmitter.emit("TOGGLE");
    });
  }
}
