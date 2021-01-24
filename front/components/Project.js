import Inbox from "./inbox/index.js";
import Component from "./Component.js";
import Cancel from "./icons/Cancel.js";
import Check from "./icons/Check.js";
import Trash from "./icons/Trash.js";
import NewInbox from "./icons/NewInbox.js";

import { debounceEvent } from "../../utils/rendering.js";
import { postData, messages } from "../messages.js";

const states = {
  ADD_INBOX: "add_inbox",
  VIEW: "view"
};

class Project extends Component {
  constructor(el, props) {
    super(el, props);
    this.state = {
      current: states.VIEW
    };
    el.innerHTML = `
      <div class="project actions">
        <h1 class="project title ellipsis">${props.name}</h1>
        <div style="display:flex;">
          <button title="add inbox to project" class="project add-inbox" aria-label="add inbox to project">
          ${NewInbox()}
          </button>
          <button title="delete project" class="project delete-project" aria-label="delete project">
          ${Trash()}
          </button>
        </div>
      </div>
    `;
    const inboxes = props.inboxes;
    inboxes.forEach(inbox => {
      const inboxContainer = document.createElement("div");
      inboxContainer.classList.add("inbox", "container");
      inboxContainer.dataset.key = inbox.id;
      this.el.appendChild(inboxContainer);
      new Inbox(inboxContainer, { inbox });
    });
    const addInboxButton = el.querySelector(".project.add-inbox");
    addInboxButton.addEventListener("click", () =>
      this.setState({ current: states.ADD_INBOX })
    );
    const deleteProjectButton = el.querySelector(".project.delete-project");
    deleteProjectButton.addEventListener("click", this.deleteProject);

    el.addEventListener("click", this.clickAway, false);
    const projectTitle = el.querySelector(".project.title");
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
  deleteProject = () => {
    const { id } = this.props;
    postData(messages.DeleteProject, {
      project_id: id
    });
  };
  clickAway = () => {
    const titleEdit = this.el.querySelector(".as-h1");
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
    const titleEl = this.el.querySelector("h1");
    if (titleEl) titleEl.innerText = name;
    const children = this.el.querySelectorAll(".inbox.container");

    // create the cardForm component
    const newInboxForm = this.el.querySelector(".project.inbox-form");
    const addInboxButton = this.el.querySelector(".project.add-inbox");
    if (this.state.current === states.ADD_INBOX && !newInboxForm) {
      addInboxButton.innerHTML = Cancel();
      const inboxForm = document.createElement("div");
      inboxForm.classList.add("project", "inbox-form");
      this.el.insertBefore(inboxForm, children[0]);
      new NewInboxForm(inboxForm, {
        project: id,
        closeForm: () => {
          this.setState({ current: states.VIEW });
        }
      });
    }
    if (this.state.current === states.VIEW && newInboxForm) {
      this.el.removeChild(newInboxForm);
      addInboxButton.innerHTML = NewInbox();
    }
    this.sweepAndUpdate();
  }
  sweepAndUpdate() {
    const { inboxes } = this.props;
    const children = this.el.querySelectorAll(".inbox.container");
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
        this.el.appendChild(inboxContainer);
        new Inbox(inboxContainer, { inbox });
      }
    });
    markedToRemove.forEach(oldNode => {
      this.el.removeChild(oldNode);
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
    const inboxName = this.el.querySelector("input");
    if (inboxName.value !== "") {
      const { project, closeForm } = this.props;
      postData(messages.CreateInbox, {
        project,
        name: inboxName.value.trim()
      });
      closeForm();
    }
  };
}

export default Project;
