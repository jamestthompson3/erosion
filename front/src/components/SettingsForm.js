import Component from "./Component.js";
import { appSettings, postData, messages } from "../messages.js";

export default class SettingsForm extends Component {
  constructor(el, p) {
    super(el, p);
    el.innerHTML = `
      <div class="settings-form">
        <form>
          <h2 class="settings title">Settings</h2>
          <fieldset >
          <legend>Display</legend>
          <label for="user">Username:</label>
          <input name="user" type="text" value=${appSettings.get("user")} />
          <span class="settings-form field-wrapper">
            <input name="show_complete" value="true" type="radio" id="show-complete" />
            <label for="show-complete">Display completed tasks</label>
          </span>
          <span class="settings-form field-wrapper">
            <input name="show_complete" value="false" type="radio" id="hide-complete" />
            <label for="hide-complete">Hide completed tasks</label>
          </span>
          <span class="settings-form field-wrapper">
          <input type="checkbox" name="run_as_daemon" id="run-headless" />
            <label for="run-headless">run without GUI (still accessible through browser)</label>
          </span>
          </fieldset>

          <span class="settings-actions">
            <button class="settings-save" type="submit">Save</button>
            <button class="settings-cancel" type="button">Cancel</button>
          </span>
        </form>
      </div>
    `;
    const showCompleted = el.querySelector("#show-complete");
    const hideCompleted = el.querySelector("#hide-complete");
    const runHeadless = el.querySelector("#run-headless");
    runHeadless.checked = appSettings.get("run_as_daemon");
    showCompleted.checked = appSettings.get("show_complete");
    hideCompleted.checked = !appSettings.get("show_complete");
    const cancelButton = el.querySelector(".settings-cancel");
    cancelButton.addEventListener("click", this.cancel);
    el.querySelector("form").addEventListener(
      "submit",
      this.handleChangeCompleted
    );
    const classWatcher = new MutationObserver(this.update);
    classWatcher.observe(el, { subtree: false, attributes: true });
  }

  update = () => {
    const closeOnEsc = (e) => {
      if (e.code === "Escape") {
        this.removeModalBlur();
      }
    };
    if (!this.el.classList.contains("hidden")) {
      this.applyModalBlur();
      document.addEventListener("keyup", closeOnEsc);
    } else {
      document.removeEventListener("keyup", closeOnEsc);
    }
  };
  applyModalBlur() {
    this.oldDocStyle = document.body.style.backgroundColor;
    const workspaceContainer = document.querySelector(".workspace.container");
    document.body.style.backgroundColor = "rgba(0,0,0,0.3)";
    workspaceContainer.style.filter = "blur(2px)";
    workspaceContainer.style.pointerEvents = "none";
  }
  removeModalBlur() {
    document.body.style.backgroundColor = this.oldDocStyle;
    const workspaceContainer = document.querySelector(".workspace.container");
    workspaceContainer.style.filter = "";
    this.el.classList.add("hidden");
    workspaceContainer.style.pointerEvents = "all";
  }
  cancel = () => {
    this.el.classList.add("hidden");
    this.removeModalBlur();
  };
  handleChangeCompleted = (e) => {
    e.preventDefault();
    const f = new FormData(this.el.querySelector("form"));
    const formAsObj = Object.fromEntries(f);
    formAsObj["show_complete"] = JSON.parse(formAsObj["show_complete"]); // becuase radio buttons return strings
    formAsObj["run_as_daemon"] =
      formAsObj["run_as_daemon"] === "on" ? true : false;
    const newSettings = Object.assign(
      {},
      Object.fromEntries(appSettings),
      formAsObj
    );
    console.log(newSettings);
    postData(messages.UpdateSettings, newSettings);
    this.removeModalBlur();
  };
}
