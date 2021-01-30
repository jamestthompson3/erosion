import Component from "./Component.js";

export default class MenuSelect extends Component {
  constructor(el, props) {
    super(el, props);
    this.state = {
      shown: false
    };
    el.innerHTML = `
      ${props.trigger()}
    `;
    const triggerElement = el.children[0];
    triggerElement.addEventListener("click", e => {
      e.stopPropagation();
      this.setState({ shown: !this.state.shown });
    });
  }
  update() {
    const { shown } = this.state;
    const { children, position } = this.props;
    const trigger = this.el.children[0];
    const menu = this.el.querySelector(".contextual.menu");
    const clickOutsideListener = e => {
      const appended = this.el.querySelector(".contextual.menu"); // select after we place menu
      if (!appended) return;
      if (!appended.contains(e.target) && shown) {
        this.setState({ shown: !shown });
      }
    };
    if (shown && !menu) {
      const anchorRect = trigger.getBoundingClientRect();
      const menu = document.createElement("div");
      menu.classList.add("contextual", "menu");
      menu.style.top =
        position === "right"
          ? `${anchorRect.top + pageYOffset}px`
          : `${anchorRect.bottom + 5 + pageYOffset}px`;
      menu.innerHTML = `
       ${children.render()}
      `;
      children.bootstrap(menu);
      this.el.appendChild(menu);
      const menuRect = menu.getBoundingClientRect();
      menu.style.left =
        position === "right"
          ? `${anchorRect.right + 10}px`
          : `${anchorRect.left - menuRect.width / 3.5}px`;
      document.addEventListener("click", clickOutsideListener);
    }
    if (!shown && menu) {
      const menu = this.el.querySelector(".contextual.menu");
      this.el.removeChild(menu);
      document.removeEventListener("click", clickOutsideListener);
    }
  }
}
