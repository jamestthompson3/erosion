import Component from "./Component.js";
import NewProject from "./icons/NewProject.js";

export default class WorkspaceSidebar extends Component {
  constructor(el, props) {
    super(el, props);
    this.parent.innerHTML = `
      ${NewProject()}
    `;
  }
}
