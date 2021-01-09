import Card from "./Card.js";
import DayPicker from "./DayPicker.js";
import Component from "./Component.js";

class Inbox {
  constructor(inbox, parent) {
    this.state = {
      inbox,
      showForm: false
    };
    this.parent = parent;
    this.mount();
  }
  mount() {
    const { inbox } = this.state;
    const container = document.createElement("div");
    container.classList.add("inbox", "container");
    container.dataset.key = inbox.id;
    container.innerHTML = `
      <div class="inbox actions">
        <h2 class="inbox title">${inbox.name}</h2>
        <button class="inbox add-card" aria-label="add card to inbox">➕</button>
      </div>
      <div class="inbox card-form"></div>
    `;
    this.parent.appendChild(container);
    this.container = container;
    // create the cardForm component
    const newCardForm = container.querySelector(".inbox.card-form");
    new InboxCardForm(newCardForm);
    // add event listeners
    const addButton = container.querySelector("button");
    addButton.onclick = this.addCard;
    // create cards
    const cards = inbox.cards;
    cards.forEach(card => {
      const cardContainer = document.createElement("div");
      cardContainer.classList.add("card", "container");
      cardContainer.dataset.key = card.id;
      container.appendChild(cardContainer);
      new Card(cardContainer, { card });
    });
  }
  addCard() {
    console.log("to implement");
  }
  update(next) {
    // merge new state onto existing one
    Object.assign(this.state, next);
    const { inbox } = this.state;
    // update singleton children
    const title = this.container.querySelector("h2");
    title.innerText = inbox.name;
    // update mapped children
    const cards = this.container.querySelectorAll(".card.container");
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
        existingChild.update(card);
      } else {
        existingChild = new Card(card, this.container);
      }
    });
    markedToRemove.forEach(oldNode => {
      this.container.removeChild(oldNode);
    });
  }
}

class InboxCardForm extends Component {
  constructor(parent) {
    super(parent);
    this.state = {
      scheduled: new Date(),
      title: undefined,
      text: undefined,
      time_allotted: 0
    };
    this.render();
  }
  render() {
    const { scheduled } = this.state;
    this.parent.innerHTML = `
      <label for="title">card title</label>
      <input type="text" class="as-h3" id="title" placeholder="card title">
      <label for="body">card text (optional)</label>
      <textarea class="as-p" id="body" placeholder="(optional) Add a description, links, or encouragement"></textarea>
      <div class="metadata">
         <div class="day-container"></div>
      </div>
    `;
    const dayPicker = this.parent.querySelector(".day-container");
    new DayPicker(dayPicker, {
      day: scheduled,
      updateDay: day => this.setState({ scheduled: day })
    });
  }
  update() {
    const { scheduled } = this.state;
    const dayPicker = this.parent.querySelector(".day-container");
    dayPicker.update({ day: scheduled });
  }
}

export default Inbox;
