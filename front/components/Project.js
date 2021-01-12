import Inbox from "./inbox/index.js";
import Component from "./Component.js";

import { debounceEvent } from "../../utils/rendering.js";
import { postData, messages } from "../messages.js";

class Project extends Component {
  constructor(parent, props) {
    super(parent, props);
    parent.innerHTML = `
      <h1 class="project title">${props.name}</h1>
    `;
    const inboxes = props.inboxes;
    inboxes.forEach(inbox => {
      const inboxContainer = document.createElement("div");
      inboxContainer.classList.add("inbox", "container");
      inboxContainer.dataset.key = inbox.id;
      this.parent.appendChild(inboxContainer);
      new Inbox(inboxContainer, { inbox });
    });

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
    const { name } = this.props;
    const titleEl = this.parent.querySelector("h1");
    if (titleEl) titleEl.innerText = name;
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

export default Project;
