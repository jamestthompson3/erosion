import { postData, messages, appContext } from "../messages.js";
import { existsAndRender, debounceEvent } from "../utils/rendering.js";
import Component from "./Component.js";

class Card extends Component {
  constructor(el, props) {
    super(el, props);
    this.color = this.createCardColor();
    this.state = { ...props };
    const { card } = this.state;
    el.innerHTML = `
        <div class="card status-container">
          <div title=${card.status} class="card status">
            <input type="checkbox" id=${card.id} ${existsAndRender(
      card.status === "Done",
      "checked"
    )}/>
            <label for=${card.id}></label>
          </div>
          <div class="card description" data-status=${card.status}>
            <h3 class="card title ellipsis">${card.title}</h3>
            <p class="card text ellipsis">${card.text || ""}</p>
          </div>
        </div>
      <div class="card metadata">
      <p>📆 ${existsAndRender(
        card.scheduled,
        new Intl.DateTimeFormat("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        }).format(new Date(card.scheduled))
      )}</p>
      <p>⌛ ${card.time_allotted} min</p>
            ${existsAndRender(card.tags, () =>
              // TODO maybe do some sort of emoji mapping to mental state
              card.tags.map(t => `<p class="card tag">🧠 ${t}</p>`).join("\n")
            )}
      </div>
        <div class="card actions">
          <button aria-label="delete card" class="card actions delete">
            <svg xmlns="http://www.w3.org/2000/svg"   viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
          <button aria-label="edit card" class="card actions edit">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"  fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                <path d="M30 7 L25 2 5 22 3 29 10 27 Z M21 6 L26 11 Z M5 22 L10 27 Z" />
            </svg>
          </button>
        </div>
    `;

    const cardStatus = el.querySelector("input");
    el.addEventListener("click", this.clickAway, false);
    cardStatus.indeterminate = card.status === "InProgress";
    this.el.style.setProperty("--color", this.color);
    cardStatus.addEventListener("change", this.updateStatus);
    const deleteButton = this.el.querySelector("button.card.actions.delete");

    this.setUpEditableEvents();
    const editButton = this.el.querySelector("button.card.actions.edit");
    deleteButton.addEventListener("click", this.deleteCard);
    editButton.addEventListener("click", () => {});
  }
  createCardColor() {
    const colors = [
      "#7400b8ff",
      "#6930c3ff",
      "#5e60ceff",
      "#5390d9ff",
      "#4ea8deff",
      "#48bfe3ff",
      "#56cfe1ff",
      "#64dfdfff",
      "#72efddff",
      "#80ffdbff"
    ];
    const rand = () => ~~(Math.random() * 9);
    return colors[rand()];
  }
  setUpEditableEvents() {
    const { card } = this.props;
    const cardTitle = this.el.querySelector(".card.title");
    const cardText = this.el.querySelector(".card.text");
    if (cardTitle) {
      const titleEdit = document.createElement("input");
      titleEdit.classList.add("card", "as-h3");
      titleEdit.value = card.title;
      titleEdit.addEventListener(
        "change",
        debounceEvent(e => {
          this.updateField({ title: e.target.value });
        }, 500)
      );
      titleEdit.addEventListener("keyup", e => {
        if (e.which === 13) {
          e.preventDefault();
          this.clickAway();
        }
      });

      cardTitle.addEventListener("dblclick", () => {
        cardTitle.replaceWith(titleEdit);
        titleEdit.focus();
        titleEdit.addEventListener("click", e => {
          e.stopPropagation();
        });
      });
    }
    if (cardText) {
      const textEdit = document.createElement("textarea");
      textEdit.classList.add("card", "as-p");
      textEdit.value = card.text;
      cardText.addEventListener("dblclick", () => {
        cardText.replaceWith(textEdit);
        textEdit.focus();
        textEdit.addEventListener("click", e => {
          e.stopPropagation();
        });
      });
      textEdit.addEventListener(
        "change",
        debounceEvent(e => {
          if (e.which === 18) {
            e.preventDefault();
            this.clickAway();
          }
          this.updateField({ text: e.target.value });
        }, 500)
      );
    }
  }
  clickAway = () => {
    const textEdit = this.el.querySelector(".as-p");
    if (textEdit) {
      const cardText = document.createElement("p");
      cardText.classList.add("card", "text");
      cardText.innerText = textEdit.value;
      textEdit.replaceWith(cardText);
      cardText.addEventListener("dblclick", () => {
        cardText.replaceWith(textEdit);
        textEdit.focus();
        textEdit.addEventListener("click", e => {
          e.stopPropagation();
        });
      });
    }
    const titleEdit = this.el.querySelector(".as-h3");
    if (titleEdit) {
      const cardTitle = document.createElement("h3");
      cardTitle.classList.add("card", "title");
      cardTitle.innerText = titleEdit.value;
      titleEdit.replaceWith(cardTitle);
      cardTitle.addEventListener("dblclick", () => {
        cardTitle.replaceWith(titleEdit);
        titleEdit.focus();
        titleEdit.addEventListener("click", e => {
          e.stopPropagation();
        });
      });
    }
  };
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
    const cardStatus = this.el.querySelector("input");
    const cardTitle = this.el.querySelector(".card.title");
    const cardText = this.el.querySelector(".card.text");
    const cardDescription = this.el.querySelector(".card.description");
    const cardStatusContainer = this.el.querySelector(".card.status");
    cardStatusContainer.title = card.status;
    cardStatus.checked = card.status === "Done";
    cardStatus.indeterminate = card.status === "InProgress";
    cardDescription.dataset.status = card.status;
    if (cardTitle) cardTitle.innerText = card.title;
    if (cardText) cardText.innerText = card.text;
  }
}

export default Card;
