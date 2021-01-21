import DayPicker from "../DayPicker.js";
import Component from "../Component.js";
import { postData, messages, appContext } from "../../messages.js";
import { addDays, addHours, addMinutes } from "../../utils/time.js";

import InboxTagTime from "./InboxTagTime.js";

class NewCardForm extends Component {
  constructor(parent, props) {
    super(parent, props);
    this.state = {
      scheduled: undefined,
      title: undefined,
      text: undefined,
      time_allotted: 0,
      tags: [],
      customDate: false
    };
    const { time_allotted, tags } = this.state;
    this.parent.innerHTML = `
      <label for="title">card title</label>
      <input type="text" class="as-h3" id="title" placeholder="card title">
      <label for="body">card text (optional)</label>
      <textarea class="as-p" id="body" placeholder="(optional) Add a description, links, or encouragement"></textarea>
      <div class="inbox card-form metadata">
         <div class="day-container">
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
         <div class="card-form tags-time"></div>
      </div>
      <button class="card-form save-button">Save</button>
    `;
    const tagsTime = this.parent.querySelector(".card-form.tags-time");
    const timeScheduled = this.parent.querySelector("#task-scheduled");
    timeScheduled.addEventListener("change", this.scheduled);
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
  scheduled = e => {
    const today = new Date();
    switch (e.target.value) {
      case "20":
        this.setState({ scheduled: addMinutes(today, 20) });
        break;
      case "1":
        this.setState({ scheduled: addHours(today, 1) });
        break;
      case "tomorrow":
        this.setState({ scheduled: new Date(addDays(today, 1).setHours(9)) });
        break;
      case "next week":
        this.setState({ scheduled: new Date(addDays(today, 7).setHours(9)) });
        break;
      case "custom":
        this.setState({ customDate: true });
        break;
      default:
        break;
    }
  };
  update() {
    const { scheduled, time_allotted, tags, customDate } = this.state;
    const dayPicker = this.parent.querySelector(".day-container");
    if (customDate) {
      new DayPicker(dayPicker, {
        day: scheduled || new Date(),
        updateDay: day => this.setState({ scheduled: day })
      });
    }
    const tagsTime = this.parent.querySelector(".card-form.tags-time");
    tagsTime.update({ time: time_allotted, tags });
  }
}

export default NewCardForm;
