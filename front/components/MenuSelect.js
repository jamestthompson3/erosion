import Component from "./Component.js";

/**
 * @param el {HTMLElement}
 * @param props { import("./types").MenuSelectProps }
 */
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
      if (appended !== e.target && shown) {
        this.setState({ shown: !shown });
      }
    };
    if (shown && !menu) {
      const anchorRect = trigger.getBoundingClientRect();
      const menu = document.createElement("div");
      menu.classList.add("contextual", "menu");
      const [yPos, xPos] = getRelativePosition(position);
      menu.innerHTML = `
       ${children.render()}
      `;
      children.bootstrap(menu);
      this.el.appendChild(menu);
      menu.style.top = getTopPosition(yPos, xPos, anchorRect);
      const menuRect = menu.getBoundingClientRect();
      menu.style.left = getLeftPosition(xPos, anchorRect, menuRect);
      document.addEventListener("click", clickOutsideListener);
    }
    if (!shown && menu) {
      const menu = this.el.querySelector(".contextual.menu");
      this.el.removeChild(menu);
      document.removeEventListener("click", clickOutsideListener);
    }
  }
}

function getRelativePosition(descriptor = "right") {
  return descriptor.split("-");
}

function getTopPosition(yPos, xPos, anchorRect) {
  switch (yPos) {
    case "fixed": {
      return xPos === "right"
        ? `${anchorRect.top + 5}px`
        : `${anchorRect.bottom + 5}px`;
    }
    default: {
      return xPos === "right"
        ? `${anchorRect.top + pageYOffset}px`
        : `${anchorRect.bottom + 5 + pageYOffset}px`;
    }
  }
}

function getLeftPosition(xPos, anchorRect, menuRect) {
  switch (xPos) {
    case "right": {
      return `${anchorRect.right + 10}px`;
    }
    default: {
      return `${anchorRect.left - menuRect.width / 3.5}px`;
    }
  }
}
