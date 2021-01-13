import Inbox from "./inbox/index.js";
import Component from "./Component.js";

import { debounceEvent } from "../../utils/rendering.js";
import { postData, messages } from "../messages.js";

class Project extends Component {
  constructor(parent, props) {
    super(parent, props);
    parent.innerHTML = `
      <div class="project actions">
        <h1 class="project title">${props.name}</h1>
        <button title="add inbox to project" class="project add-inbox" aria-label="add inbox to project">
          <svg viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
              <g id="Dribbble-Light-Preview" transform="translate(-380.000000, -1039.000000)" fill="currentColor">
              <g id="icons" transform="translate(56.000000, 160.000000)">
                <path d="M331,885 C331,884.448 331.448,884 332,884 L333,884 L333,883 C333,882.448 333.448,882 334,882 C334.552,882 335,882.448 335,883 L335,884 L336,884 C336.552,884 337,884.448 337,885 C337,885.552 336.552,886 336,886 L335,886 L335,887 C335,887.552 334.552,888 334,888 C333.448,888 333,887.552 333,887 L333,886 L332,886 C331.448,886 331,885.552 331,885 L331,885 Z M341,889 L341,886 L342,889 L341,889 L341,889 Z M342,896 C342,896.552 341.552,897 341,897 L327,897 C326.448,897 326,896.552 326,896 L326,891 L329,891 C329.552,891 330,891.448 330,892 L330,893 C330,894.105 330.895,895 332,895 L336,895 C337.105,895 338,894.105 338,893 L338,892 C338,891.448 338.448,891 339,891 L342,891 L342,896 L342,896 Z M327,886 L327,889 L326,889 L327,886 L327,886 Z M329,882 C329,881.448 329.448,881 330,881 L338,881 C338.552,881 339,881.448 339,882 L339,889 L338,889 C336.895,889 336,889.895 336,891 L336,892 C336,892.552 335.552,893 335,893 L333,893 C332.448,893 332,892.552 332,892 L332,891 C332,889.895 331.105,889 330,889 L329,889 L329,882 L329,882 Z M342,883 L341,883 L341,881 C341,879.895 340.105,879 339,879 L329,879 C327.895,879 327,879.895 327,881 L327,883 L326,883 L324,889 L324,897 C324,898.105 324.895,899 326,899 L342,899 C343.105,899 344,898.105 344,897 L344,889 L342,883 L342,883 Z" id="inbox_plus_round-[#1541]"></path>
              </g>
              </g>
            </g>
          </svg>
        </button>
      </div>
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
