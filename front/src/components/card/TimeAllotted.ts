import Component, { CustomElement } from "../Component";

import { Cancel } from "../icons";
import { animationInterval } from "../../utils/rendering";

interface TimeAllottedProps {
  timeAllotted: number;
}

const MIN_TO_S = (min: number) => min * 60;
enum TimerState {
  Stopped,
  Paused,
  Running,
}

export default class TimeAllotted extends Component {
  constructor(el: CustomElement, props: TimeAllottedProps) {
    super(el, props);
    this.state = {
      timerState: TimerState.Stopped,
      controller: new AbortController(),
      timeEllapsed: 0,
    };
    const { timeAllotted } = props;
    el.innerText = `⌛ ${timeAllotted} min`;
    el.addEventListener("click", this.handleCountdown);
    el.title = "start pomodoro timer";
  }
  handleCountdown = (e: MouseEvent): void => {
    const { timeAllotted } = this.props;
    if (timeAllotted === 0) return;
    const { timerState, controller, runningTime, timeEllapsed } = this.state;
    switch (timerState) {
      case TimerState.Running: {
        controller.abort();
        this.setState({
          timerState: TimerState.Paused,
          timeEllapsed: runningTime + timeEllapsed,
        });
        if (!this.el.querySelector("button")) {
          const cancelButton = document.createElement("button");
          cancelButton.classList.add("time-allotted", "cancel-button");
          cancelButton.title = "cancel timer";
          cancelButton.innerHTML = Cancel();
          this.el.appendChild(cancelButton); // = cancelButton + this.el.innerHTML;
        }
        this.el.title = "start";
        break;
      }
      case TimerState.Paused: {
        const cancelButton = this.el.querySelector("button");
        this.setState({
          controller: new AbortController(),
        });
        if (
          cancelButton &&
          (cancelButton.contains(e.target as Node) || cancelButton === e.target)
        ) {
          this.setState({
            timerState: TimerState.Stopped,
            runningTime: 0,
            timeEllapsed: 0,
          });
          this.el.innerText = `⌛ ${timeAllotted} min`;
          this.el.title = "start pomodoro timer";
          this.el.removeChild(cancelButton);
          break;
        }
        this.runAnim(e.timeStamp);
        break;
      }
      case TimerState.Stopped: {
        // Create an animation callback every second:
        this.runAnim(e.timeStamp);
        this.setState({ timerState: TimerState.Running });
        break;
      }
    }
  };
  runAnim = (timestamp) => {
    const { timeAllotted } = this.props;
    const { controller } = this.state;
    animationInterval(timestamp, 1000, controller.signal, (time) => {
      const { timeEllapsed } = this.state;
      let currentTimeInSeconds = MIN_TO_S(timeAllotted - 1) - timeEllapsed;
      const ellapsedSeconds = Math.round(time / 1000);
      const remainingSeconds =
        (MIN_TO_S(timeAllotted) - ellapsedSeconds - timeEllapsed) % 60; // total time - time on current countdown - total time ellapsed between pauses
      if (currentTimeInSeconds === 0 && remainingSeconds === 0) {
        controller.abort();
      }
      if (ellapsedSeconds % 60 === 0) {
        currentTimeInSeconds = currentTimeInSeconds - ellapsedSeconds;
      }
      const seconds =
        remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
      this.el.innerText = `⏸️ ${Math.round(
        currentTimeInSeconds / 60
      )}:${seconds}`;
      this.el.title = "pause";
      this.setState({ runningTime: time / 1000 });
    });
  };
  update = (): void => {
    // NOOP
  };
}
