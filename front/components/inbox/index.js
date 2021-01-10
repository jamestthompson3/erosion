import Card from "../Card.js";
import Component from "../Component.js";

import NewCardForm from "./NewCardForm.js";

class Inbox extends Component {
  constructor(parent, inbox) {
    super(parent, inbox);
    this.state = {
      inbox,
      showForm: false
    };
    parent.innerHTML = `
      <div class="inbox actions">
        <h2 class="inbox title">${inbox.name}</h2>
        <button class="inbox add-card" aria-label="add card to inbox">➕</button>
      </div>
    `;
    // add event listeners
    const addButton = parent.querySelector(".inbox.add-card");
    addButton.addEventListener("click", this.openForm);
    // create cards
    const cards = inbox.cards;
    cards.forEach(card => {
      const cardContainer = document.createElement("div");
      cardContainer.classList.add("card", "container");
      cardContainer.dataset.key = card.id;
      parent.appendChild(cardContainer);
      new Card(cardContainer, { card });
    });
  }
  openForm = () => {
    this.setState({ showForm: !this.state.showForm });
  };
  update() {
    const { inbox } = this.state;
    const cards = this.parent.querySelectorAll(".card.container");
    // update singleton children
    const title = this.parent.querySelector("h2");
    title.innerText = inbox.name;
    // create the cardForm component
    const newCardForm = this.parent.querySelector(".inbox.card-form");
    if (this.state.showForm && !newCardForm) {
      const cardForm = document.createElement("div");
      cardForm.classList.add("inbox", "card-form");
      this.parent.insertBefore(cardForm, cards[0]);
      new NewCardForm(cardForm, {
        inbox: this.state.inbox.id,
        closeForm: () => {
          this.setState({ showForm: false });
        }
      });
    }
    if (!this.state.showForm && newCardForm) {
      this.parent.removeChild(newCardForm);
    }
    // update mapped children
    const markedToRemove = new Set(cards);
    // create a map here so we can quickly look up if the child exists by using the cardId
    const childrenById = new Map();
    markedToRemove.forEach(child => {
      childrenById.set(child.dataset.id, child);
    });
    inbox.cards.forEach(card => {
      let existingChild = childrenById.get(card.id);
      if (existingChild) {
        markedToRemove.delete(existingChild);
        existingChild.withProps(card);
      } else {
        const cardContainer = document.createElement("div");
        cardContainer.classList.add("card", "container");
        cardContainer.dataset.key = card.id;
        this.parent.appendChild(cardContainer);
        existingChild = new Card(cardContainer, { card });
      }
    });
    markedToRemove.forEach(oldNode => {
      this.parent.removeChild(oldNode);
    });
  }
}

export default Inbox;
