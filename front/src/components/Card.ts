import { postData, messages, appContext } from "../messages.js";
import {
  existsAndRender,
  debounceEvent,
  createCardColor,
} from "../utils/rendering.js";
import { VertMenu, Trash, Edit } from "./icons";
import Component from "./Component";
import MenuSelect from "./MenuSelect";
import { Card, CardStatus } from "../types.d";

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
      <p>⌛ ${card.time_allotted} min</p>
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
  constructor(el, props) {
    super(el, props);
    this.state = { ...props };
    const { card } = this.state;
    el.innerHTML = renderElementHtml(card);
    const actionContainer = el.querySelector(".card.actions");
    new MenuSelect(actionContainer, {
      trigger: () =>
        `<button class="card actions menu-button" aria-label="card actions">${VertMenu()}</button>`,
      children: {
        render: () => `
      <button aria-label="delete card" class="card actions delete">${Trash()}</button>
      <button aria-label="edit card" class="card actions edit">${Edit()}</button>
      `,
        bootstrap: (menu: HTMLDivElement) => {
          const deleteButton = menu.querySelector(".card.actions.delete");
          deleteButton.addEventListener("click", this.deleteCard);
        },
      },
    });
    const cardStatus = el.querySelector("input");
    cardStatus.indeterminate = card.status === "InProgress";
    this.el.style.setProperty("--color", createCardColor());
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
  deleteCard = () => {
    const {
      card: { id },
    } = this.state;
    const keyedByCard = appContext.get("cardKeyed")[id];
    const { inbox, project } = keyedByCard;
    postData(messages.DeleteCard, {
      inbox,
      project,
      card: id,
    });
  };
  updateStatus = () => {
    const {
      card: { status },
    } = this.state;
    switch (status) {
      case "Done":
        this.updateField({ status: CardStatus.Todo, completed: null });
        break;
      case "Todo":
        this.updateField({ status: CardStatus.InProgress });
        break;
      case "InProgress":
        this.updateField({
          status: CardStatus.Done,
          completed: new Date().toString(),
        });
        break;
      default:
        break;
    }
  };
  updateField(updatedData: Partial<Card>) {
    const { card } = this.state;
    const keyedCard = appContext.get("cardKeyed")[card.id];
    const { inbox, project } = keyedCard;
    const updated = { ...card, ...updatedData };
    postData(messages.UpdateCard, {
      inbox,
      project,
      card: updated,
    });
    this.setState({ card: updated });
  }
  update = () => {
    const { card } = this.state;
    // adjust dynamic data
    // get selectors
    const cardStatus = this.el.querySelector("input");
    const cardTitle: HTMLHeadingElement = this.el.querySelector(".card.title");
    const cardText: HTMLParagraphElement = this.el.querySelector(".card.text");
    const cardDescription: HTMLDivElement = this.el.querySelector(
      ".card.description"
    );
    const cardStatusContainer: HTMLDivElement = this.el.querySelector(
      ".card.status"
    );
    cardStatusContainer.title = card.status;
    cardStatus.checked = card.status === "Done";
    cardStatus.indeterminate = card.status === "InProgress";
    cardDescription.dataset.status = card.status;
    if (cardTitle) cardTitle.innerText = card.title;

    if (cardText) cardText.innerText = card.text;
  };
}

export default CardComponent;
