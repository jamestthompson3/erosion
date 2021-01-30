import Component from "./Component.js";
import NewProject from "./icons/NewProject.js";
import Logo from "./icons/Logo.js";
import MenuSelect from "./MenuSelect.js";
import Settings from "./icons/Settings.js";
import SettingsForm from "./SettingsForm.js";
import { newProjectEmitter } from "../messages.js";

export default class WorkspaceSidebar extends Component {
  constructor(el, props) {
    super(el, props);
    const settingsPanel = document.createElement("div");
    settingsPanel.id = "settings-panel";
    settingsPanel.classList.add("workspace", "settings-panel", "hidden");
    document.body.appendChild(settingsPanel);
    new SettingsForm(settingsPanel);
    new MenuSelect(el, {
      trigger: () =>
        `<button class="workspace action-trigger" title="workspace actions" aria-label="workspace actions">${Logo()}</button>`,
      children: {
        render: () => `
          <button aria-label="add project" title="add project to workspace" class="workspace action add-project">${NewProject()}</button>
          <div class="workspace sidebar action-spacer"></div>
          <button aria-label="edit settings" title="edit settings" class="workspace action edit-settings">${Settings()}</button>
        `,
        bootstrap: menu => {
          const newProjectButton = menu.querySelector(".workspace.add-project");
          newProjectButton.addEventListener("click", () => {
            newProjectEmitter.emit("TOGGLE");
          });
          const settingsButton = menu.querySelector(".workspace.edit-settings");
          settingsButton.addEventListener("click", this.displaySettings);
        }
      },
      position: window.innerWidth <= 700 ? "fixed" : "fixed-right"
    });
  }
  displaySettings = () => {
    const settingsPanel = document.querySelector("#settings-panel");
    settingsPanel.classList.toggle("hidden");
  };
}
