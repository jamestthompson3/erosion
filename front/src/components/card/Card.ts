import { Card, CardStatus } from "../../types.d";
import {
  createCardColor,
  debounceEvent,
  existsAndRender,
} from "../../utils/rendering";

import Actions from "./Actions";
import CardModel from "./CardModel";
import Component from "../Component";
import TimeAllotted from "./TimeAllotted";

function renderElementHtml(card: Card) {
  const getChecked = (status: CardStatus) =>
    existsAndRender(status === CardStatus.Done, "checked");
  const getScheduled = (scheduled: string) =>
    existsAndRender(
      scheduled,
      `<p>📆
          ${new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }).format(new Date(scheduled))}</p>`
    );
  return `
        <div class="card status-container">
          <div title=${card.status} class="card status">
            <input type="checkbox" id=${card.id} ${getChecked(card.status)}/>
            <label for=${card.id}></label>
          </div>
          <div class="card description" data-status=${card.status}>
            <h3 class="card title -ellipsis -text-cursor">${card.title}</h3>
            <p class="card text -ellipsis -text-cursor">${card.text || ""}</p>
          </div>
        </div>
      <div class="card metadata">
      ${getScheduled(card.scheduled)}
      <p class="card time"></p>
            ${existsAndRender(card.tags, () =>
              // TODO maybe do some sort of emoji mapping to mental state
              card.tags.map((t) => `<p class="card tag">🧠 ${t}</p>`).join("\n")
            )}
      </div>
        <div class="card actions">
        </div>
    `;
}

class CardComponent extends Component {
  model: CardModel;
  constructor(el, props) {
    super(el, props);
    this.state = { ...props };
    const { card } = this.state;
    const [color, contrast] = createCardColor();
    el.innerHTML = renderElementHtml(card);
    this.model = new CardModel(props.card);
    const actionContainer = el.querySelector(".card.actions");
    new Actions(actionContainer, {
      card,
      color,
      contrast,
      postUpdate: this.updateField,
      deleteCard: this.model.deleteCard,
    });
    new TimeAllotted(el.querySelector(".card.time"), {
      timeAllotted: card.time_allotted,
    });
    const cardStatus = el.querySelector("input");
    cardStatus.indeterminate = card.status === "InProgress";
    this.el.style.setProperty("--color", color);
    this.el.style.setProperty("--contrast", contrast);
    cardStatus.addEventListener("change", this.updateStatus);
    this.setUpEditableEvents();
  }
  setUpEditableEvents() {
    const { card } = this.props;
    const cardTitle: HTMLHeadingElement = this.el.querySelector(".card.title");
    const cardText: HTMLParagraphElement = this.el.querySelector(".card.text");
    if (cardTitle) {
      const titleEdit = document.createElement("input");
      titleEdit.classList.add("card", "as-h3");
      titleEdit.value = card.title;
      titleEdit.addEventListener(
        "change",
        debounceEvent((e) => {
          this.updateField({ title: (e.target as HTMLInputElement).value });
        }, 500)
      );
      titleEdit.addEventListener("keyup", (e) => {
        if (e.code === "Escape") {
          e.preventDefault();
          this.clickAway();
        }
      });

      this.setUpDblClick(cardTitle, titleEdit);
    }
    if (cardText) {
      const textEdit: HTMLTextAreaElement = document.createElement("textarea");
      textEdit.classList.add("card", "as-p");
      textEdit.value = card.text;
      this.setUpDblClick(cardText, textEdit);
      textEdit.addEventListener(
        "change",
        debounceEvent((e) => {
          this.updateField({ text: (e.target as HTMLInputElement).value });
        }, 500)
      );
      textEdit.addEventListener("keyup", (e) => {
        if (e.code === "Escape") {
          e.preventDefault();
          this.clickAway();
        }
      });
    }
  }
  setUpDblClick = (
    node: HTMLHeadingElement | HTMLParagraphElement,
    replacement: HTMLInputElement | HTMLTextAreaElement
  ) => {
    node.addEventListener("dblclick", () => {
      document.addEventListener("click", this.clickAway);
      node.replaceWith(replacement);
      replacement.focus();
      replacement.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    });
  };

  clickAway = () => {
    const textEdit: HTMLInputElement = this.el.querySelector(".as-p");
    if (textEdit) {
      const cardText = document.createElement("p");
      cardText.classList.add("card", "text", "-ellipsis", "-text-cursor");
      cardText.innerText = textEdit.value;
      textEdit.replaceWith(cardText);
      this.setUpDblClick(cardText, textEdit);
      document.removeEventListener("click", this.clickAway);
    }
    const titleEdit: HTMLInputElement = this.el.querySelector(".as-h3");
    if (titleEdit) {
      const cardTitle = document.createElement("h3");
      cardTitle.classList.add("card", "title", "-text-cursor", "-ellipsis");
      cardTitle.innerText = titleEdit.value;
      titleEdit.replaceWith(cardTitle);
      cardTitle.addEventListener("dblclick", () => {
        document.addEventListener("click", this.clickAway);
        cardTitle.replaceWith(titleEdit);
        titleEdit.focus();
        titleEdit.addEventListener("click", (e) => {
          e.stopPropagation();
        });
      });
      document.removeEventListener("click", this.clickAway);
    }
  };
  updateStatus = () => {
    const updated = this.model.updateStatus();
    this.setState({ card: updated });
  };
  updateField = (updatedData: Partial<Card>) => {
    const updated = this.model.updateField(updatedData);
    this.setState({ card: updated });
  };
  update = () => {
    const { card } = this.state;
    // adjust dynamic data
    // get selectors
    const cardStatus = this.el.querySelector("input");
    const cardTitle: HTMLHeadingElement = this.el.querySelector(".card.title");
    const cardText: HTMLParagraphElement = this.el.querySelector(".card.text");
    const cardTime: HTMLParagraphElement = this.el.querySelector(".card.time");

    const cardDescription: HTMLDivElement = this.el.querySelector(
      ".card.description"
    );
    const cardStatusContainer: HTMLDivElement = this.el.querySelector(
      ".card.status"
    );
    cardStatusContainer.title = card.status;
    cardTime.innerText = `⌛ ${card.time_allotted} min`;
    cardStatus.checked = card.status === "Done";
    cardStatus.indeterminate = card.status === "InProgress";
    cardDescription.dataset.status = card.status;
    if (cardTitle) cardTitle.innerText = card.title;

    if (cardText) cardText.innerText = card.text;
  };
}

export default CardComponent;
