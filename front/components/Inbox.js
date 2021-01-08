import Card from "./Card.js";

class Inbox {
  constructor(inbox, parent) {
    this.inbox = inbox;
    this.parent = parent;
    this.mount();
    this.createCards();
  }
  mount() {
    const container = document.createElement("div");
    container.classList.add("inbox", "container");
    container.dataset.key = this.inbox.id;
    container.innerHTML = [
      `<h2 class="inbox title">${this.inbox.name}</h2>`
    ].join("\n");
    this.parent.appendChild(container);
  }
  createCards() {
    const cards = this.inbox.cards;
    const container = this.parent.querySelector(`[data-key=${this.inbox.id}]`);
    cards.forEach(card => {
      new Card(card, container);
    });
  }
}

export default Inbox;
