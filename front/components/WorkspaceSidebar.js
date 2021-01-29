import Component from "./Component.js";
import NewProject from "./icons/NewProject.js";
import Settings from "./icons/Settings.js";
import SettingsForm from "./SettingsForm.js";
import { newProjectEmitter } from "../messages.js";

export default class WorkspaceSidebar extends Component {
  constructor(el, props) {
    super(el, props);
    this.el.innerHTML = `
      <button aria-label="add project" title="add project to workspace" class="workspace add-project">${NewProject()}</button>
      <button aria-label="edit settings" title="edit settings" class="workspace edit-settings">${Settings()}</button>
    `;
    const newProjectButton = this.el.querySelector(".workspace.add-project");
    newProjectButton.addEventListener("click", () => {
      newProjectEmitter.emit("TOGGLE");
    });
    const settingsButton = this.el.querySelector(".workspace.edit-settings");
    const settingsPanel = document.createElement("div");
    settingsPanel.id = "settings-panel";
    settingsPanel.classList.add("workspace", "settings-panel", "hidden");
    document.body.appendChild(settingsPanel);
    new SettingsForm(settingsPanel);
    settingsButton.addEventListener("click", this.displaySettings);
  }
  displaySettings = () => {
    const settingsPanel = document.querySelector("#settings-panel");
    settingsPanel.classList.toggle("hidden");
  };
}
