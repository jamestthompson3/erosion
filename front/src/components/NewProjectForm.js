import { messages, newProjectEmitter, postData } from "../messages";

import Cancel from "./icons/Cancel";
import Check from "./icons/Check";
import Component from "./Component";

class NewProjectForm extends Component {
  constructor(el, props) {
    super(el, props);
    this.state = {
      current: "VIEW",
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
        name: projectName.value.trim(),
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

export default NewProjectForm;
