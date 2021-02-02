import Card from "../Card.js";
import Component from "../Component.js";
import Cancel from "../icons/Cancel.js";
import Collapse from "../icons/Collapse.js";
import Expand from "../icons/Expand.js";
import Add from "../icons/Add.js";
import Trash from "../icons/Trash.js";
import { debounceEvent } from "../../utils/rendering.js";
import { postData, messages, appContext, appSettings } from "../../messages.js";

import NewCardForm from "./NewCardForm.js";

class Inbox extends Component {
  constructor(el, props) {
    super(el, props);
    const showComplete = appSettings.get("show_complete");
    this.state = {
      showForm: false,
    };
    const { inbox } = props;
    el.innerHTML = `
      <div class="inbox actions">
        <h2 class="inbox title -ellipsis">${inbox.name}</h2>
            <div id="inbox-action-indicator">
              <button title="collapse view" class="inbox collapse" aria-label="collapse view">${Expand()}</button>
              <button title="add card to inbox" class="inbox add-card" aria-label="add card to inbox">${Add()}</button>
              <button title="delete inbox" class="inbox delete-inbox" aria-label="delete inbox">${Trash()}</button>
            </div>
          </div>
      </div>
    `;
    // add event listeners
    const addButton = el.querySelector(".inbox.add-card");
    addButton.addEventListener("click", this.openForm);
    const collapseButton = el.querySelector(".inbox.collapse");
    collapseButton.addEventListener("click", this.toggleCollapse);
    const deleteButton = el.querySelector(".inbox.delete-inbox");
    deleteButton.addEventListener("click", this.delete);
    // TODO handle outside click on whole document
    el.addEventListener("click", this.clickAway, false);
    const boxTitle = el.querySelector(".inbox.title");
    if (boxTitle) {
      const titleEdit = document.createElement("input");
      titleEdit.classList.add("inbox", "as-h2");
      titleEdit.value = inbox.name;
      titleEdit.addEventListener(
        "change",
        debounceEvent((e) => {
          this.updateField({ name: e.target.value });
        }, 500)
      );
      titleEdit.addEventListener("keyup", (e) => {
        if (e.which === 13) {
          e.preventDefault();
          this.clickAway();
        }
      });

      boxTitle.addEventListener("dblclick", () => {
        boxTitle.replaceWith(titleEdit);
        titleEdit.focus();
        titleEdit.addEventListener("click", (e) => {
          e.stopPropagation();
        });
      });
    }
    // create cards
    const { cards } = this.props.inbox;
    // FIXME figure out hou to do this maybe on the backend?
    cards
      .filter((c) => (showComplete ? true : c.status !== "Done"))
      .forEach((card) => {
        const cardContainer = document.createElement("div");
        cardContainer.classList.add("card", "container");
        cardContainer.dataset.key = card.id;
        cardContainer.draggable = "true";
        cardContainer.addEventListener("mousedown", () => {
          cardContainer.style.cursor = "grabbing";
        });
        cardContainer.addEventListener("mouseup", () => {
          cardContainer.style.cursor = "grab";
        });
        cardContainer.addEventListener("dragend", () => {
          cardContainer.style.cursor = "grab";
        });
        el.appendChild(cardContainer);
        new Card(cardContainer, { card });
      });
    // collapse cards if saved in localStorage
    if (JSON.parse(localStorage.getItem(`${this.props.inbox.id}-collapsed`))) {
      const children = this.el.querySelectorAll(".card.container");
      const actionsContainer = this.el.querySelector("#inbox-action-indicator");
      const headerActions = this.el.querySelector(".inbox.actions");
      const collapseButton = actionsContainer.querySelector(".inbox.collapse");
      this.styleCollapse(children, headerActions, collapseButton);
    }
  }
  delete = () => {
    const { inbox } = this.props;

    const keyedInbox = appContext.get("inboxKeyed")[inbox.id];
    const { project } = keyedInbox;
    let confirmed = confirm(`Delete Inbox ${inbox.name}?`);
    confirmed &&
      postData(messages.DeleteInbox, {
        project,
        inbox: inbox.id,
      });
  };
  clickAway = () => {
    const titleEdit = this.el.querySelector(".as-h2");
    if (titleEdit) {
      const boxTitle = document.createElement("h2");
      boxTitle.classList.add("inbox", "title");
      boxTitle.innerText = titleEdit.value;
      titleEdit.replaceWith(boxTitle);
      boxTitle.addEventListener("dblclick", () => {
        boxTitle.replaceWith(titleEdit);
        titleEdit.focus();
        titleEdit.addEventListener("click", (e) => {
          e.stopPropagation();
        });
      });
    }
  };
  openForm = () => {
    this.setState({ showForm: !this.state.showForm });
  };
  toggleCollapse = () => {
    const children = this.el.querySelectorAll(".card.container");
    const actionsContainer = this.el.querySelector("#inbox-action-indicator");
    const headerActions = this.el.querySelector(".inbox.actions");
    const collapseButton = actionsContainer.querySelector(".inbox.collapse");
    if (JSON.parse(localStorage.getItem(`${this.props.inbox.id}-collapsed`))) {
      this.styleExpand(children, headerActions, collapseButton);
    } else {
      this.styleCollapse(children, headerActions, collapseButton);
    }
  };

  styleExpand = (children, headerActions, collapseButton) => {
    children.forEach((child) => {
      child.style.display = "flex";
    });
    localStorage.setItem(`${this.props.inbox.id}-collapsed`, false);
    const indicatorBox = this.el.querySelector(".inbox.indicator");
    indicatorBox && headerActions.removeChild(indicatorBox);
    collapseButton.innerHTML = Expand();
  };

  styleCollapse = (children, headerActions, collapseButton) => {
    children.forEach((child) => {
      child.style.display = "none";
    });
    localStorage.setItem(`${this.props.inbox.id}-collapsed`, true);
    const inboxIndicator = document.createElement("h4");
    inboxIndicator.classList.add("inbox", "indicator");

    const showComplete = appSettings.get("show_complete");
    const indicatorNumber = this.props.inbox.cards.filter((c) =>
      showComplete ? true : c.status !== "Done"
    ).length;
    inboxIndicator.innerText = indicatorNumber;
    indicatorNumber > 0 &&
      headerActions.insertBefore(
        inboxIndicator,
        headerActions.querySelector(".inbox.title")
      );
    collapseButton.innerHTML = Collapse();
  };

  updateField(updatedData) {
    const { inbox } = this.props;
    const keyedInbox = appContext.get("inboxKeyed")[inbox.id];
    const { project } = keyedInbox;
    const updated = { ...inbox, ...updatedData };
    postData(messages.UpdateInbox, {
      project,
      inbox: updated,
    });
    this.withProps({ inbox: updated });
  }
  update() {
    const { inbox } = this.props;
    const cards = this.el.querySelectorAll(".card.container");
    // update singleton children
    const title = this.el.querySelector("h2");
    const inboxIndicator = this.el.querySelector(".inbox.indicator");

    const showComplete = appSettings.get("show_complete");
    const indicatorNumberText = this.props.inbox.cards.filter((c) =>
      showComplete ? true : c.status !== "Done"
    ).length;
    if (inboxIndicator) inboxIndicator.innerText = indicatorNumberText;
    if (title) title.innerText = inbox.name;
    // create the cardForm component
    const newCardForm = this.el.querySelector(".inbox.card-form");
    const addButton = this.el.querySelector(".inbox.add-card");
    if (this.state.showForm && !newCardForm) {
      addButton.innerHTML = Cancel();
      const cardForm = document.createElement("div");
      cardForm.classList.add("inbox", "card-form");
      this.el.insertBefore(cardForm, cards[0]);
      new NewCardForm(cardForm, {
        inbox: inbox.id,
        closeForm: () => {
          this.setState({ showForm: false });
        },
      });
    }
    if (!this.state.showForm && newCardForm) {
      addButton.innerHTML = Add();
      this.el.removeChild(newCardForm);
    }
    this.sweepAndUpdate();
  }
  sweepAndUpdate() {
    const children = this.el.querySelectorAll(".card.container");
    // create a map here so we can quickly look up if the child exists by using the cardId
    const childrenById = new Map();
    const markedToRemove = new Set(children);
    markedToRemove.forEach((child) => {
      childrenById.set(child.dataset.key, child);
    });

    const showComplete = appSettings.get("show_complete");
    const cards = this.props.inbox.cards.filter((c) =>
      showComplete ? true : c.status !== "Done"
    );

    cards.forEach((card) => {
      const childToUpdate = childrenById.get(card.id);
      if (childToUpdate) {
        markedToRemove.delete(childToUpdate);
        childToUpdate.withProps({ card });
      } else {
        const cardContainer = document.createElement("div");
        const inboxCollapsed = JSON.parse(
          localStorage.getItem(`${this.props.inbox.id}-collapsed`)
        );
        cardContainer.classList.add("card", "container");
        if (inboxCollapsed) {
          cardContainer.style.display = "none";
        }
        cardContainer.dataset.key = card.id;
        this.el.appendChild(cardContainer);
        new Card(cardContainer, { card });
      }
    });
    markedToRemove.forEach((oldNode) => {
      this.el.removeChild(oldNode);
    });
  }
}

export default Inbox;
