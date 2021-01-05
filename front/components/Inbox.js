import Card from "./Card.js";

class Inbox {
  constructor(inbox, parent) {
    this.inbox = inbox;
    this.parent = parent;
    this.createContainer();
    this.createTitle();
    this.createCards();
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
  createCards() {
    const cards = this.inbox.cards;
    cards.forEach(card => {
      new Card(card, this.container);
    });
  }
}

export default Inbox;
