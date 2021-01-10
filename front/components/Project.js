import Inbox from "./inbox/index.js";
import Component from "./Component.js";

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
  }
  update() {
    const { name } = this.props;
    const titleEl = this.parent.querySelector("h1");
    titleEl.innerText = name;
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
