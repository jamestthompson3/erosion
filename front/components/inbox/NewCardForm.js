import DayPicker from "../DayPicker.js";
import Component from "../Component.js";
import { postData, messages, appContext } from "../../messages.js";

import InboxTagTime from "./InboxTagTime.js";

class NewCardForm extends Component {
  constructor(parent, props) {
    super(parent, props);
    this.state = {
      scheduled: new Date(),
      title: undefined,
      text: undefined,
      time_allotted: 0,
      tags: []
    };
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
    const { inbox, closeForm } = this.props;
    const { project } = appContext.get("inboxKeyed")[inbox];
    postData(messages.CreateCard, {
      card: { ...this.state, status: "Todo" },
      project,
      inbox
    });
    closeForm();
  };
  // NOTE! calling this with new props won't do anything.
  update() {
    const { scheduled, time_allotted, tags } = this.state;
    const dayPicker = this.parent.querySelector(".day-container");
    const tagsTime = this.parent.querySelector(".card-form.tags-time");
    tagsTime.update({ time: time_allotted, tags });
    dayPicker.update({ day: scheduled });
  }
}

export default NewCardForm;
