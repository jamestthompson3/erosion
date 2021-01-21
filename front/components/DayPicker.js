import { addDays, addMonths, formatTimeString } from "../utils/time.js";
import Component from "./Component.js";

class DayPicker extends Component {
  constructor(parent, props) {
    super(parent, props);
    parent.update = this.update;
    this.render();
  }
  render() {
    const { day } = this.props;
    this.parent.innerHTML = `
      <div class="month">
        <button class="increment-decrement" id="month-decrement">
        👈
        </button>
        <span>
          ${new Intl.DateTimeFormat("en-US", { month: "long" }).format(day)}
        </span>
        <button class="increment-decrement" id="month-increment">
          👉
        </button>
      </div>
      <div class="day">
        <div class="day-modifier">
        <button class="increment-decrement" id="day-decrement">
          👇
        </button>
        <input
          type="text"
          class="day-input"
          inputMode="numeric"
          pattern="[0-9]*"
          value=${day.getDate()}
        />
        <button class="increment-decrement" id="day-increment">
          ☝️
        </button>
      </div>
      <input
        type="time"
        class="time-input"
        value=${String.prototype.concat(
          formatTimeString(day.getHours()),
          ":",
          formatTimeString(day.getMinutes())
        )}
      />
    </div>
`;
    // attach event listeners
    const monthIncrement = this.parent.querySelector("#month-increment");
    const monthDecrement = this.parent.querySelector("#month-decrement");
    const dayIncrement = this.parent.querySelector("#day-increment");
    const dayDecrement = this.parent.querySelector("#day-decrement");
    const dayUpdater = this.parent.querySelector(".day-input");
    const timeUpdater = this.parent.querySelector(".time-input");
    monthIncrement.addEventListener("click", this.incrementMonth);
    monthDecrement.addEventListener("click", this.decrementMonth);
    dayIncrement.addEventListener("click", this.incrementDay);
    dayDecrement.addEventListener("click", this.decrementDay);
    dayUpdater.addEventListener("change", this.updateDay);
    timeUpdater.addEventListener("change", this.setTime);
  }
  update = () => {
    this.render();
  };
  decrementMonth = () => {
    const { day } = this.props;
    const { updateDay } = this.props;
    updateDay(addMonths(day, -1));
  };
  incrementMonth = () => {
    const { day } = this.props;
    const { updateDay } = this.props;
    updateDay(addMonths(day, 1));
  };
  decrementDay = () => {
    const { day } = this.props;
    const { updateDay } = this.props;
    updateDay(addDays(day, -1));
  };
  incrementDay = () => {
    const { day } = this.props;
    const { updateDay } = this.props;
    updateDay(addDays(day, 1));
  };
  updateDay = e => {
    const { day } = this.props;
    const value = e.target.value;
    const { updateDay } = this.props;
    updateDay(new Date(day.setDate(value)));
  };
  setTime = e => {
    const { day } = this.props;
    const time = e.target.value.split(":");
    const { updateDay } = this.props;
    updateDay(new Date(day.setHours(...time)));
  };
}

export default DayPicker;
