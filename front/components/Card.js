import { postData, messages, appContext } from "../messages.js";
import Component from "./Component.js";

class Card extends Component {
  constructor(parent, props) {
    super(parent, props, "CARD");
    this.color = this.createCardColor();
    this.state = { ...props };
    const { card } = this.state;
    parent.innerHTML = `
        <div class="card status-container">
          <div title=${card.status} class="card status">
            <input type="checkbox" id=${card.id} ${
      card.status === "Done" ? "checked" : ""
    }/>
            <label for=${card.id}></label>
          </div>
          <div class="card description" data-status=${card.status}>
            <h3 class="card title">${card.title}</h3>
            <p class="card text">${card.text || ""}</p>
          </div>
        </div>
        <div class="card actions">
          <button class="card actions delete">🗑</button>
        </div>
    `;
    const cardStatus = this.parent.querySelector("input");
    cardStatus.indeterminate = card.status === "InProgress";
    this.parent.style.setProperty("--color", this.color);
    cardStatus.addEventListener("change", this.updateStatus);
    const deleteButton = this.parent.querySelector(
      "button.card.actions.delete"
    );
    deleteButton.addEventListener("click", this.deleteCard);
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
    const rand = () => ~~(Math.random() * 6);
    return colors[rand()];
  }
  deleteCard = () => {
    const {
      card: { id }
    } = this.state;
    const keyedByCard = appContext.get("cardKeyed")[id];
    const { inbox, project } = keyedByCard;
    postData(messages.DeleteCard, {
      inbox,
      project,
      card: id
    });
  };
  updateStatus = () => {
    const {
      card: { status }
    } = this.state;
    switch (status) {
      case "Done":
        this.updateField({ status: "Todo", completed: null });
        break;
      case "Todo":
        this.updateField({ status: "InProgress" });
        break;
      case "InProgress":
        this.updateField({ status: "Done", completed: new Date() });
        break;
      default:
        break;
    }
  };
  updateField(updatedData) {
    const { card } = this.state;
    const keyedCard = appContext.get("cardKeyed")[card.id];
    const { inbox, project } = keyedCard;
    const updated = { ...card, ...updatedData };
    postData(messages.UpdateCard, {
      inbox,
      project,
      card: updated
    });
    this.setState({ card: updated });
  }
  update() {
    const { card } = this.state;
    // adjust dynamic data
    // get selectors
    const cardStatus = this.parent.querySelector("input");
    const cardTitle = this.parent.querySelector(".card.title");
    const cardText = this.parent.querySelector(".card.text");
    const cardDescription = this.parent.querySelector(".card.description");
    const cardStatusContainer = this.parent.querySelector(".card.status");
    cardStatusContainer.title = card.status;
    cardStatus.checked = card.status === "Done";
    cardStatus.indeterminate = card.status === "InProgress";
    cardDescription.dataset.status = card.status;
    cardTitle.innerText = card.title;
    cardText.innerText = card.text;
  }
}

export default Card;
