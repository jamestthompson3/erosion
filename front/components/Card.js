import { global, messages, appContext } from "../messages.js";
import Component from "./Component.js";

class Card extends Component {
  constructor(parent, props) {
    super(parent, props);
    this.state = {
      color: this.createCardColor(),
      card: props.card
    };
    this.render();
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
  render() {
    const { card, color } = this.state;
    this.parent.innerHTML = `
        <div class="card status">
         <input type="checkbox" id=${card.id} ${
      card.status === "Done" ? "checked" : ""
    }/>
         <label for=${card.id}></label>
        </div>
        <div class="card description" data-status=${card.status}>
         <h3 class="card title">${card.title}</h3>
         <p class="card text">${card.text}</p>
        </div>
    `;
    const cardStatus = this.parent.querySelector("input");
    cardStatus.indeterminate = card.status === "InProgress";
    this.parent.style.setProperty("--color", color);
    cardStatus.addEventListener("change", this.updateStatus);
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
    const keyedCard = appContext.get("keyed")[card.id];
    const { inbox, project } = keyedCard;
    const updated = Object.assign({}, card, updatedData);
    global.emit(messages.UpdateCard, {
      inbox,
      project,
      card: updated
    });
    this.setState({ card: updated });
  }
  update() {
    this.render();
  }
}
export default Card;
