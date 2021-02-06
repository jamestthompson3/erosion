import Component from "../Component";

class InboxTagTime extends Component {
  constructor(el, props) {
    super(el, props);
    this.render();
  }
  render = () => {
    const { time, tags } = this.props;
    this.el.innerHTML = `
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
    const timeInput: HTMLInputElement = this.el.querySelector(
      "#new-card-time-allotted"
    );
    timeInput.value = time;
    timeInput.addEventListener("change", this.handleTimeChange);
    const tagSelect = this.el.querySelector("select");
    tagSelect.value = tags[0];
    tagSelect.addEventListener("change", this.handleTagChange);
  };
  handleTimeChange = (e: Event) => {
    const { updateTime } = this.props;
    const isValidNumber = !isNaN(
      parseInt((e.target as HTMLInputElement).value)
    );
    if (isValidNumber) {
      updateTime(parseInt((e.target as HTMLInputElement).value));
    }
  };
  handleTagChange = (e: Event) => {
    const { updateTags } = this.props;
    updateTags((e.target as HTMLInputElement).value);
  };
  update = () => {
    this.render();
  };
}

export default InboxTagTime;
