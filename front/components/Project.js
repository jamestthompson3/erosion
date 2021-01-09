import Inbox from "./Inbox.js";

class Project {
  constructor(project) {
    this.project = project;
    this.createContainer();
    this.createTitle();
    this.createInboxes();
  }
  createContainer() {
    const container = document.createElement("div");
    this.container = container;
    container.classList.add("project", "container");
    document.body.appendChild(container);
  }
  createTitle() {
    const title = document.createElement("h1");
    title.innerText = this.project.name;
    title.classList.add("project", "title");
    this.container.appendChild(title);
  }
  createInboxes() {
    const inboxes = this.project.inboxes;
    inboxes.forEach(inbox => {
      const inboxContainer = document.createElement("div");
      inboxContainer.classList.add("inbox", "container");
      inboxContainer.dataset.key = inbox.id;
      this.container.appendChild(inboxContainer);
      new Inbox(inboxContainer, inbox);
    });
  }
}

export default Project;
