import Cancel from "./icons/Cancel";
import Check from "./icons/Check";
import Component from "./Component";

import { postData, messages } from "../messages";

class NewInboxForm extends Component {
  constructor(el, props) {
    super(el, props);
    el.innerHTML = `
      <input placeholder="inbox name" class="project new-inbox-name" type="text"></inbox>
      <button class="inbox-form accept" title="save inbox">${Check()}</button>
      <button class="inbox-form cancel" title="cancel creation">${Cancel()}</button>
    `;
    const input = el.querySelector("input");
    input.focus();
    const save = el.querySelector(".inbox-form.accept");
    const cancel = el.querySelector(".inbox-form.cancel");
    save.addEventListener("click", this.save);
    cancel.addEventListener("click", () => this.props.closeForm());
  }
  save = () => {
    const inboxName = this.el.querySelector("input");
    if (inboxName.value !== "") {
      const { project, closeForm } = this.props;
      postData(messages.CreateInbox, {
        project,
        name: inboxName.value.trim(),
      });
      closeForm();
    }
  };
}

export default NewInboxForm;
