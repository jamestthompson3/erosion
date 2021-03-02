import Component, { CustomElement } from "../Component";

import { animationInterval } from "../../utils/rendering";

interface TimeAllottedProps {
  timeAllotted: number;
}

//TODO change to a state machine that can handle play, pause, stop, etc.

const MIN_TO_S = (min: number) => min * 60;
export default class TimeAllotted extends Component {
  constructor(el: CustomElement, props: TimeAllottedProps) {
    super(el, props);
    this.state = {
      timerStarted: false,
      controller: new AbortController(),
    };
    const { timeAllotted } = props;
    el.innerText = `⌛ ${timeAllotted} min`;
    el.addEventListener("click", this.handleCountdown);
  }
  handleCountdown = (e: MouseEvent): void => {
    const { timeAllotted } = this.props;
    if (this.state.timerStarted) {
      this.state.controller.abort();
    }
    let currentTime = timeAllotted;
    // Create an animation callback every second:
    animationInterval(e.timeStamp, 1000, this.state.controller.signal, (time) => {
      const roundedTime = Math.round(time / 1000);
      const remainingSeconds = (MIN_TO_S(timeAllotted) - roundedTime) % 60;
      if (currentTime === 0 && remainingSeconds === 0) {
        this.state.controller.abort();
      }
      if (roundedTime % 60 === 0) {
        currentTime = currentTime - roundedTime / 60;
      }
      const seconds =
        remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
      this.el.innerText = `${currentTime}:${seconds}`;
    });
    this.setState({ timerStarted: true });
  };
  update = (): void => {
    // NOOP
  };
}
