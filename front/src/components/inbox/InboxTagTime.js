class InboxTagTime {
  constructor(el, props) {
    this.el = el;
    this.props = props;
    el.update = this.update;
    this.render();
  }
  render() {
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
    const timeInput = this.el.querySelector("#new-card-time-allotted");
    timeInput.value = time;
    timeInput.addEventListener("change", this.handleTimeChange);
    const tagSelect = this.el.querySelector("select");
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

export default InboxTagTime;
