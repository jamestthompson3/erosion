class Card {
  constructor(card, parent) {
    console.log(card);
    this.card = card;
    this.parent = parent;
    this.createContainer();
    this.createStatus();
    this.createDescription();
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
  createContainer() {
    const container = document.createElement("div");
    this.container = container;
    container.classList.add("card", "container");
    container.style.boxShadow = `4px 4px 0 ${this.createCardColor()}`;
    this.parent.appendChild(container);
  }
  createDescription() {
    const descriptionContainer = document.createElement("div");
    this.descriptionContainer = descriptionContainer;
    descriptionContainer.classList.add("card", "description");
    descriptionContainer.dataset.status = this.card.status;
    const title = document.createElement("h3");
    title.innerText = this.card.title;
    const text = document.createElement("p");
    text.innerText = this.card.text;
    text.classList.add("card", "text");
    title.classList.add("card", "title");
    descriptionContainer.appendChild(title);
    descriptionContainer.appendChild(text);
    this.container.appendChild(descriptionContainer);
  }
  createStatus() {
    const cardStatus = document.createElement("input");
    cardStatus.type = "checkbox";
    cardStatus.classList.add("card", "status");
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
    this.container.appendChild(cardStatus);
  }
}

export default Card;
