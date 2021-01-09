import { global, messages, appContext } from "../messages.js";

class Card {
  constructor(card, parent) {
    this.card = card;
    this.parent = parent;
    this.color = this.createCardColor();
    this.mount();
    this.setDynamicProperties();
  }
  createCardColor() {
    const colors = [
      "rgb(193, 0, 255)",
      "rgb(0, 0, 255)",
      "rgb(255, 0, 0)",
      "rgb(0, 255, 0)",
      "rgb(255, 210,98)",
      "rgb(255, 98, 220)"
    ];
    const rand = () => ~~(Math.random() * 5) + 1;
    return colors[rand()];
  }
  mount() {
    const container = document.createElement("div");
    container.classList.add("card", "container");
    container.dataset.key = this.card.id;
    container.innerHTML = `
        <div class="card status">
         <input type="checkbox" id=${this.card.id} />
         <label for=${this.card.id}></label>
        </div>
        <div class="card description" data-status=${this.card.status}>
         <h3 class="card title">${this.card.title}</h3>
         <p class="card text">${this.card.text}</p>
        </div>
    `;
    this.parent.appendChild(container);
    const cardStatus = container.querySelector("input");
    cardStatus.addEventListener("change", () => {
      switch (this.card.status) {
        case "Done":
          cardStatus.checked = false;
          this.updateField({ status: "Todo" });
          break;
        case "Todo":
          cardStatus.checked = false;
          cardStatus.indeterminate = true;
          this.updateField({ status: "InProgress" });
          break;
        case "InProgress":
          cardStatus.indeterminate = false;
          cardStatus.checked = true;
          this.updateField({ status: "Done" });
          break;
        default:
          break;
      }
    });
  }
  setDynamicProperties() {
    const container = this.parent.querySelector(`[data-key=${this.card.id}]`);
    const cardStatus = container.querySelector("input");
    const cardDescription = container.querySelector(".card.description");
    container.style.setProperty("--color", this.color);
    cardDescription.dataset.status = this.card.status;
    switch (this.card.status) {
      case "Done":
        cardStatus.checked = true;
        break;
      case "Todo":
        cardStatus.checked = false;
        break;
      case "InProgress":
        cardStatus.indeterminate = true;
        break;
      default:
        break;
    }
  }
  updateField(updatedData) {
    const keyedCard = appContext.get("keyed")[this.card.id];
    const { inbox, project } = keyedCard;
    const card = Object.assign({}, this.card, updatedData);
    global.emit(messages.UpdateCard, {
      inbox,
      project,
      card
    });
    this.update(card);
  }
  update(next) {
    // merge new state onto existing one
    Object.assign(this.card, next);
    this.setDynamicProperties();
  }
}
export default Card;
