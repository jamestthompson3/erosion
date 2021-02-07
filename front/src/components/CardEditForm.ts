import Component from "./Component";
import DayPicker from "./common-ui/DayPicker";
import { addDays, addHours, addMinutes } from "src/utils/time";
import InboxTagTime from "./inbox/InboxTagTime";

export default class CardEditForm extends Component {
  constructor(el, props) {
    super(el, props);
    this.state = {
      customDate: false,
    };
    const { color, contrast, postUpdate, card } = props;
    el.style.setProperty("--color", color);
    el.style.setProperty("--contrast", contrast);
    const titleEdit: HTMLInputElement = el.querySelector(".card.edit-title");
    const textEdit: HTMLTextAreaElement = el.querySelector(".card.edit-text");
    const tagsTime: HTMLSpanElement = el.querySelector("#tags-time");
    const timeScheduled = el.querySelector("#task-scheduled");
    timeScheduled.addEventListener("change", this.scheduled);
    titleEdit.value = card.title;
    textEdit.value = card.text;
    titleEdit.addEventListener("change", (e) => {
      postUpdate({ title: e.target.value });
    });
    textEdit.addEventListener("change", (e) => {
      postUpdate({ text: e.target.value });
    });
    new InboxTagTime(tagsTime, {
      time: card.time_allotted,
      tags: card.tags,
      updateTime: (time: number) => {
        postUpdate({ time_allotted: time });
      },
      updateTags: (tag: string) => {
        postUpdate({ tags: [tag] });
      },
    });
  }

  scheduled = (e) => {
    const today = new Date();
    switch ((e.target as HTMLInputElement).value) {
      case "20":
        postUpdate({ scheduled: addMinutes(today, 20) });
        break;
      case "1":
        postUpdate({ scheduled: addHours(today, 1) });
        break;
      case "tomorrow":
        postUpdate({ scheduled: new Date(addDays(today, 1).setHours(9)) });
        break;
      case "next week":
        postUpdate({ scheduled: new Date(addDays(today, 7).setHours(9)) });
        break;
      case "custom":
        this.setState({ customDate: true });
        break;
      default:
        break;
    }
  };
  update = () => {
    const { card } = this.props;
    const cardScheduled: HTMLSpanElement = this.el.querySelector(
      "#card-scheduled"
    );
    new DayPicker(cardScheduled, {
      day: card.scheduled ? new Date(card.scheduled) : new Date(),
      updateDay: (day) => {
        postUpdate({ scheduled: day });
      },
    });
  };
}
