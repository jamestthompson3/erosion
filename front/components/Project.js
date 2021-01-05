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
      new Inbox(inbox, this.container);
    });
  }
}

export default Project;
