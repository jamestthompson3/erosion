import Component from "../Component";
import MenuSelect from "../common-ui/MenuSelect.js";
import Modal from "../common-ui/Modal";
import { Edit, Trash, VertMenu } from "../icons";
import CardEditForm from "./CardEditForm";
import { Card } from "src/types";

function renderEditHtml() {
  return `
    <div class="card edit-form">
      <fieldset>
      <legend>Edit</legend>
      <div class="card edit-form form-container">
      <span>
      <label>Title</label>
      <input class="card edit-title" type="text"/>
      <label>Text</label>
      <textarea class="card edit-text"></textarea>
      </span>
      <div class="card edit-form time-container">
        <div id="tags-time"></div>
        <div id="card-scheduled">
          <label for="scheduled">Start task</label>
          <select name="task-scheduled" id="task-scheduled">
            <option value=""></option>
            <option value="20">In 20 Minutes</option>
            <option value="1">In an Hour</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="next week">Next Week</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>
      </div>
      <div class="card edit-form actions">
        <button class="card edit-form save-button">Done</button>
        <button class="card edit-form cancel-button">Cancel</button>
      </div>
      </fieldset>
    </div>
  `;
}

interface CardActionProps {
  card: Card;
  color: string;
  contrast: string;
  postUpdate(data: Partial<Card>): void;
  deleteCard(): void;
}

export default class Actions extends Component {
  constructor(el: any, props: CardActionProps) {
    super(el, props);
    const { card, color, contrast, postUpdate, deleteCard } = props;
    new MenuSelect(el, {
      trigger: () =>
        `<button class="card actions menu-button" aria-label="card actions">${VertMenu()}</button>`,
      children: {
        render: () => `
      <button aria-label="delete card" class="card actions delete">${Trash()}</button>
      <button aria-label="edit card" class="card actions edit">${Edit()}</button>
      `,
        bootstrap: (menu: HTMLDivElement) => {
          const deleteButton = menu.querySelector(".card.actions.delete");
          deleteButton.addEventListener("click", deleteCard);
          const editButton = menu.querySelector(".card.actions.edit");
          new Modal(editButton, {
            trigger: null,
            children: {
              render: renderEditHtml,
              bootstrap: (modal, onClose) => {
                new CardEditForm(modal, {
                  card,
                  color,
                  contrast,
                  postUpdate,
                  onClose,
                });
              },
            },
          });
        },
      },
    });
  }
}
