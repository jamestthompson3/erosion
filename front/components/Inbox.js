class Inbox {
  constructor(inbox, parent) {
    this.inbox = inbox;
    this.parent = parent;
    this.createContainer();
    this.createTitle();
  }
  createContainer() {
    const container = document.createElement("div");
    this.container = container;
    container.classList.add("inbox", "container");
    this.parent.appendChild(container);
  }
  createTitle() {
    const title = document.createElement("h2");
    title.classList.add("inbox", "title");
    title.innerText = this.inbox.name;
    this.container.appendChild(title);
  }
}

export default Inbox;
