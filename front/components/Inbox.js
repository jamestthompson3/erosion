import Card from "./Card.js";
import DayPicker from "./DayPicker.js";
import Component from "./Component.js";
import { global, messages, appContext } from "../messages.js";

class Inbox {
  constructor(inbox, parent) {
    this.state = {
      inbox,
      showForm: false
    };
    this.parent = parent;
    this.mount();
  }
  mount() {
    const { inbox } = this.state;
    const container = document.createElement("div");
    container.classList.add("inbox", "container");
    container.dataset.key = inbox.id;
    container.innerHTML = `
      <div class="inbox actions">
        <h2 class="inbox title">${inbox.name}</h2>
        <button class="inbox add-card" aria-label="add card to inbox">➕</button>
      </div>
    `;
    this.parent.appendChild(container);
    this.container = container;
    // add event listeners
    const addButton = container.querySelector(".inbox.add-card");
    addButton.addEventListener("click", this.openForm);
    // create cards
    const cards = inbox.cards;
    cards.forEach(card => {
      const cardContainer = document.createElement("div");
      cardContainer.classList.add("card", "container");
      cardContainer.dataset.key = card.id;
      container.appendChild(cardContainer);
      new Card(cardContainer, { card });
    });
  }
  openForm = () => {
    this.update({ showForm: !this.state.showForm });
  };
  update(next) {
    const cards = this.container.querySelectorAll(".card.container");
    // merge new state onto existing one
    Object.assign(this.state, next);
    const { inbox } = this.state;
    // update singleton children
    const title = this.container.querySelector("h2");
    title.innerText = inbox.name;
    // create the cardForm component
    const newCardForm = this.container.querySelector(".inbox.card-form");
    if (this.state.showForm && !newCardForm) {
      const cardForm = document.createElement("div");
      cardForm.classList.add("inbox", "card-form");
      this.container.insertBefore(cardForm, cards[0]);
      new InboxCardForm(cardForm, { inbox: this.state.inbox.id });
    }
    if (!this.state.showForm && newCardForm) {
      this.container.removeChild(newCardForm);
    }
    // update mapped children
    const markedToRemove = new Set(cards);
    // create a map here so we can quickly look up if the child exists by using the cardId
    const childrenById = new Map();
    markedToRemove.forEach(child => {
      childrenById.set(child.dataset.id, child);
    });
    inbox.cards.forEach(card => {
      let existingChild = childrenById.get(card.id);
      if (existingChild) {
        markedToRemove.delete(existingChild);
        existingChild.update(card);
      } else {
        existingChild = new Card(card, this.container);
      }
    });
    markedToRemove.forEach(oldNode => {
      this.container.removeChild(oldNode);
    });
  }
}

class InboxCardForm extends Component {
  constructor(parent, props) {
    super(parent, props);
    this.state = {
      scheduled: new Date(),
      title: undefined,
      text: undefined,
      time_allotted: 0,
      tags: []
    };
    this.render();
  }
  render() {
    const { scheduled, time_allotted, tags } = this.state;
    this.parent.innerHTML = `
      <label for="title">card title</label>
      <input type="text" class="as-h3" id="title" placeholder="card title">
      <label for="body">card text (optional)</label>
      <textarea class="as-p" id="body" placeholder="(optional) Add a description, links, or encouragement"></textarea>
      <div class="inbox card-form metadata">
         <div class="day-container"></div>
         <div class="card-form tags-time"></div>
      </div>
      <button class="card-form save-button">Save</button>
    `;
    const dayPicker = this.parent.querySelector(".day-container");
    new DayPicker(dayPicker, {
      day: scheduled,
      updateDay: day => this.setState({ scheduled: day })
    });
    const tagsTime = this.parent.querySelector(".card-form.tags-time");
    new InboxTagTime(tagsTime, {
      time: time_allotted,
      tags,
      updateTime: time => {
        this.setState({ time_allotted: time });
      },
      updateTags: tag => {
        this.setState({ tags: [tag] });
      }
    });
    const title = this.parent.querySelector("#title");
    title.addEventListener("change", this.handleTitleChange);
    const text = this.parent.querySelector("#body");
    text.addEventListener("change", this.handleTextChange);
    const submitButton = this.parent.querySelector(".card-form.save-button");
    submitButton.addEventListener("click", this.submit);
  }
  handleTitleChange = e => {
    this.setState({ title: e.target.value });
  };
  handleTextChange = e => {
    this.setState({ text: e.target.value });
  };
  submit = () => {
    const { project } = appContext.get("inboxKeyed")[this.props.inbox];
    global.emit(messages.CreateCard, {
      card: { ...this.state, status: "Todo" },
      project,
      inbox: this.props.inbox
    });
  };
  update() {
    const { scheduled, time_allotted, tags } = this.state;
    const dayPicker = this.parent.querySelector(".day-container");
    const tagsTime = this.parent.querySelector(".card-form.tags-time");
    tagsTime.update({ time: time_allotted, tags });
    dayPicker.update({ day: scheduled });
  }
}

class InboxTagTime extends Component {
  constructor(parent, props) {
    super(parent, props);
    parent.update = this.update;
    this.render();
  }
  render() {
    const { time, tags } = this.props;
    this.parent.innerHTML = `
      <label for="new-card-time-allotted">time allotted (min)</label>
      <input
          type="text"
          id="new-card-time-allotted"
          class="inbox card-form tags-time time-input"
          inputmode="numeric"
          pattern="[0-9]*"
      />
      <label for="task-tags">state of mind</label>
      <select name="task-tags">
      <option value=""></option>
      <option value="prioritize">Prioritize</option>
      <option value="explore">Explore</option>
      <option value="research">Research</option>
      <option value="generate">Generate</option>
      <option value="polish">Polish</option>
      <option value="administrate">Administrate</option>
      <option value="recharge">Recharge</option>
      </select>
    `;
    const timeInput = this.parent.querySelector("#new-card-time-allotted");
    timeInput.value = time;
    timeInput.addEventListener("change", this.handleTimeChange);
    const tagSelect = this.parent.querySelector("select");
    tagSelect.value = tags[0];
    tagSelect.addEventListener("change", this.handleTagChange);
  }
  handleTimeChange = e => {
    const { updateTime } = this.props;
    const isValidNumber = !isNaN(parseInt(e.target.value));
    if (isValidNumber) {
      updateTime(parseInt(e.target.value));
    }
  };
  handleTagChange = e => {
    const { updateTags } = this.props;
    updateTags(e.target.value);
  };
  update = next => {
    Object.assign(this.props, next);
    this.render();
  };
}

export default Inbox;
