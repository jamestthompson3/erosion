import Component from "../Component";
import { ModalMenuProps } from "./types";

export default class Modal extends Component {
  oldDocStyle: string;
  constructor(el: any, props: ModalMenuProps) {
    super(el, props);
    this.state = {
      shown: false,
    };
    if (typeof props.trigger === "function") {
      el.innerHTML = `${props.trigger()}`;
      const triggerElement = el.children[0];
      triggerElement.addEventListener("click", (e) => {
        e.stopPropagation();
        this.setState({ shown: !this.state.shown });
      });
    } else {
      el.addEventListener("click", (e) => {
        this.setState({ shown: !this.state.shown });
      });
    }
  }
  update = () => {
    const { shown } = this.state;
    const { children } = this.props;
    const modal: HTMLDivElement = document.body.querySelector(".modal.body");
    const handleEscape = (e) => {
      const appended = document.body.querySelector(".modal.body"); // select after we place modal
      if (!appended) return;
      if (appended && e.code === "Escape") this.setState({ shown: false });
    };
    if (shown && !modal) {
      this.applyModalBlur();
      const modal = document.createElement("div");
      modal.classList.add("modal", "body");
      modal.style.top = `${innerHeight / 3}px`;
      modal.innerHTML = `
       ${children.render()}
      `;
      children.bootstrap(modal);
      document.body.appendChild(modal);
      modal.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
      document.addEventListener("keyup", handleEscape);
    }
    if (!shown && modal) {
      this.removeModalBlur();
      const modal = document.body.querySelector(".modal.body");
      document.body.removeChild(modal);
      document.removeEventListener("keyup", handleEscape);
    }
  };

  applyModalBlur() {
    this.oldDocStyle = document.body.style.backgroundColor;
    const workspaceContainer: HTMLDivElement = document.querySelector(
      ".workspace.container"
    );
    document.body.style.backgroundColor = "rgba(0,0,0,0.3)";
    workspaceContainer.style.filter = "blur(2px)";
  }
  removeModalBlur() {
    document.body.style.backgroundColor = this.oldDocStyle;
    const workspaceContainer: HTMLDivElement = document.querySelector(
      ".workspace.container"
    );
    workspaceContainer.style.filter = "";
  }
}
