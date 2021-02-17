import Component from "./Component";

import { appContext } from "../messages";
import { Card } from "src/types";

export default class DueToday extends Component {
  constructor(el, props) {
    super(el, props);
    el.innerHTML = `
      <h2 class="workspace due-today-title">Due Today</h2>
      <div class="workspace due-today-spacer"></div>
    `;
    const dueToday = appContext.get("dueToday");
    dueToday.cards.forEach((card: Card) => {
      const summary = document.createElement("a");
      summary.innerText = card.title;
      summary.href = `#${card.id}`;
      el.appendChild(summary);
    });
  }
}
