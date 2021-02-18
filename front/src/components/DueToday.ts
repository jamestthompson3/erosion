import Component from "./Component";

import { appContext } from "../messages";
import { Card } from "src/types";

export default class DueToday extends Component {
  constructor(el, props) {
    super(el, props);
    const dueToday = appContext.get("dueToday");
    appContext.on("update", "dueToday", this.sweepAndUpdate);
    if (dueToday.cards.length === 0) {
      el.style.display = "none";
    }
    el.innerHTML = `
      <h2 class="workspace due-today-title">Due Today</h2>
      <div class="workspace due-today-spacer"></div>
      `;
    dueToday.cards.forEach((card: Card) => {
      const summary = document.createElement("a");
      summary.innerText = card.title;
      summary.href = `#${card.id}`;
      summary.dataset.key = card.id;
      el.appendChild(summary);
    });
  }
  sweepAndUpdate = () => {
    const { cards } = appContext.get("dueToday");
    const children = this.el.querySelectorAll("a") || [];
    const childrenByKey = new Map();
    const markedToRemove = new Set(children);

    markedToRemove.forEach((child: Node) => {
      childrenByKey.set(child.dataset.key, child);
    });
    if (cards.length > 0 && this.el.style.display === "none") {
      this.el.style.display = "flex";
    }
    if (cards.length === 0 && this.el.style.display === "flex") {
      this.el.style.display = "none";
    }
    cards.forEach((card: Card) => {
      const childToUpdate = childrenByKey.get(card.id);
      if (childToUpdate) {
        markedToRemove.delete(childToUpdate);
      } else {
        const newLink = document.createElement("a");
        newLink.innerText = card.title;
        newLink.href = `#${card.id}`;
        newLink.dataset.key = card.id;
        this.el.appendChild(newLink);
      }
    });
    markedToRemove.forEach((oldNode: Node) => {
      this.el.removeChild(oldNode);
    });
  };
}
