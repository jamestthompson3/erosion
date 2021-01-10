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
      new Inbox(inboxContainer, inbox);
    });
  }
  update() {
    const {
      project: { title, inboxes }
    } = this.props;
    const titleEl = this.parent.querySelector("h1");
    titleEl.innerText = title;
    this.sweepAndUpdate(".inbox.container", inboxes, Inbox);
  }
}

export default Project;
