import { postData, messages, appContext } from "../messages.js";
import Component from "./Component.js";

class Card extends Component {
  constructor(parent, props) {
    super(parent, props);
    this.color = this.createCardColor();
    this.state = { ...props };
    const { card } = this.state;
    parent.innerHTML = `
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
    `;
    const cardStatus = this.parent.querySelector("input");
    cardStatus.indeterminate = card.status === "InProgress";
    this.parent.style.setProperty("--color", this.color);
    cardStatus.addEventListener("change", this.updateStatus);
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
  updateStatus = () => {
    const {
      card: { status }
    } = this.state;
    switch (status) {
      case "Done":
        this.updateField({ status: "Todo" });
        break;
      case "Todo":
        this.updateField({ status: "InProgress" });
        break;
      case "InProgress":
        this.updateField({ status: "Done" });
        break;
      default:
        break;
    }
  };
  updateField(updatedData) {
    const { card } = this.state;
    const keyedCard = appContext.get("cardKeyed")[card.id];
    const { inbox, project } = keyedCard;
    const updated = Object.assign({}, card, updatedData);
    postData(messages.UpdateCard, {
      inbox,
      project,
      card: updated
    });
    this.setState({ card: updated });
  }
  update() {
    const { card } = this.state;
    console.log("calling update for: ", card.id);
    // adjust dynamic data
    // get selectors
    const cardStatus = this.parent.querySelector("input");
    const cardTitle = this.parent.querySelector(".card.title");
    const cardText = this.parent.querySelector(".card.text");
    const cardDescription = this.parent.querySelector(".card.description");
    const cardStatusContainer = this.parent.querySelector(".card.status");
    cardStatusContainer.title = card.title;
    cardStatus.checked = card.status === "Done";
    cardStatus.indeterminate = card.status === "InProgress";
    cardDescription.dataset.status = card.status;
    cardTitle.innerText = card.title;
    cardText.innerText = card.text;
  }
}

export default Card;
