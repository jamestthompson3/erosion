import Inbox from "./inbox/index.js";
import Component from "./Component.js";
import Cancel from "./icons/Cancel.js";
import Check from "./icons/Check.js";
import NewInbox from "./icons/NewInbox.js";

import { debounceEvent } from "../../utils/rendering.js";
import { postData, messages } from "../messages.js";

class Project extends Component {
  constructor(parent, props) {
    super(parent, props);
    this.state = {
      showForm: false
    };
    parent.innerHTML = `
      <div class="project actions">
        <h1 class="project title">${props.name}</h1>
        <button title="add inbox to project" class="project add-inbox" aria-label="add inbox to project">
        ${NewInbox()}
        </button>
      </div>
    `;
    const inboxes = props.inboxes;
    console.log(inboxes);
    inboxes.forEach(inbox => {
      const inboxContainer = document.createElement("div");
      inboxContainer.classList.add("inbox", "container");
      inboxContainer.dataset.key = inbox.id;
      this.parent.appendChild(inboxContainer);
      new Inbox(inboxContainer, { inbox });
    });
    const addInboxButton = parent.querySelector(".project.add-inbox");
    addInboxButton.addEventListener("click", () =>
      this.setState({ showForm: !this.state.showForm })
    );

    parent.addEventListener("click", this.clickAway, false);
    const projectTitle = parent.querySelector(".project.title");
    if (projectTitle) {
      const titleEdit = document.createElement("input");
      titleEdit.classList.add("project", "as-h1");
      titleEdit.value = props.name;
      titleEdit.addEventListener(
        "change",
        debounceEvent(e => {
          this.updateField({ name: e.target.value });
        }, 500)
      );
      titleEdit.addEventListener("keyup", e => {
        if (e.which === 13) {
          e.preventDefault();
          this.clickAway();
        }
      });

      projectTitle.addEventListener("dblclick", () => {
        projectTitle.replaceWith(titleEdit);
        titleEdit.focus();
        titleEdit.addEventListener("click", e => {
          e.stopPropagation();
        });
      });
    }
  }
  clickAway = () => {
    const titleEdit = this.parent.querySelector(".as-h1");
    if (titleEdit) {
      const projectTitle = document.createElement("h1");
      projectTitle.classList.add("project", "title");
      projectTitle.innerText = titleEdit.value;
      titleEdit.replaceWith(projectTitle);
      projectTitle.addEventListener("dblclick", () => {
        projectTitle.replaceWith(titleEdit);
        titleEdit.focus();
        titleEdit.addEventListener("click", e => {
          e.stopPropagation();
        });
      });
    }
  };

  updateField(updatedData) {
    const updated = { ...this.props, ...updatedData };
    postData(messages.UpdateProject, {
      project: updated
    });
    this.withProps(updated);
  }
  update() {
    const { name, id } = this.props;
    const titleEl = this.parent.querySelector("h1");
    if (titleEl) titleEl.innerText = name;
    const children = this.parent.querySelectorAll(".inbox.container");

    // create the cardForm component
    const newInboxForm = this.parent.querySelector(".project.inbox-form");
    const addInboxButton = this.parent.querySelector(".project.add-inbox");
    if (this.state.showForm && !newInboxForm) {
      addInboxButton.innerHTML = Cancel();
      const inboxForm = document.createElement("div");
      inboxForm.classList.add("project", "inbox-form");
      this.parent.insertBefore(inboxForm, children[0]);
      new NewInboxForm(inboxForm, {
        project: id,
        closeForm: () => {
          this.setState({ showForm: false });
        }
      });
    }
    if (!this.state.showForm && newInboxForm) {
      this.parent.removeChild(newInboxForm);
      addInboxButton.innerHTML = NewInbox();
    }
    this.sweepAndUpdate();
  }
  sweepAndUpdate() {
    const { inboxes } = this.props;
    const children = this.parent.querySelectorAll(".inbox.container");
    // create a map here so we can quickly look up if the child exists by using the cardId
    const childrenById = new Map();
    const markedToRemove = new Set(children);
    markedToRemove.forEach(child => {
      childrenById.set(child.dataset.key, child);
    });
    inboxes.forEach(inbox => {
      const childToUpdate = childrenById.get(inbox.id);
      if (childToUpdate) {
        markedToRemove.delete(childToUpdate);
        childToUpdate.withProps({ inbox });
      } else {
        const inboxContainer = document.createElement("div");
        inboxContainer.classList.add("inbox", "container");
        inboxContainer.dataset.key = inbox.id;
        this.parent.appendChild(inboxContainer);
        new Inbox(inboxContainer, { inbox });
      }
    });
    markedToRemove.forEach(oldNode => {
      this.parent.removeChild(oldNode);
    });
  }
}

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
    const projectName = this.parent.querySelector("input");
    if (projectName.value !== "") {
      const { project, closeForm } = this.props;
      postData(messages.CreateInbox, {
        project,
        name: projectName.value.trim()
      });
      closeForm();
    }
  };
}

export default Project;
