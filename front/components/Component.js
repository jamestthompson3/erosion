/**
 * @typedef {Object} HasId
 * @property {string} id - id for item
 */

class Component {
  constructor(el, props = {}) {
    this.el = el;
    el.withProps = this.withProps;
    this.props = props;
  }
  setState(next) {
    Object.assign(this.state, next);
    this.update();
  }
  withProps = next => {
    // very basic, can be improved
    if (JSON.stringify(this.props) !== JSON.stringify(next)) {
      Object.assign(this.props, next);
      this.update();
    }
  };
  /**
   * FIXME: Currently borked since props don't pass down correctly :/
   * @param {string} querySelector - querySelector class string like ".card.container"
   * @param {Record<string, HasId>[]} dataset  - a data set whose items implement the HasId interface
   * @param {Function} ChildClass - a class that instantiates the component's children
   */
  _sweepAndUpdate(querySelector, dataset, ChildClass) {
    const children = this.el.querySelectorAll(querySelector);
    // create a map here so we can quickly look up if the child exists by using the cardId
    const childrenById = new Map();
    const markedToRemove = new Set(children);
    markedToRemove.forEach(child => {
      childrenById.set(child.dataset.id, child);
    });
    dataset.forEach(item => {
      const childToUpdate = childrenById.get(item.id);
      if (childToUpdate) {
        markedToRemove.delete(childToUpdate);
        // WARNING this might break if props include functions
        childToUpdate.withProps(item);
      } else {
        const cardContainer = document.createElement("div");
        cardContainer.classList.add(
          ...querySelector.split(".").filter(Boolean)
        );
        cardContainer.dataset.key = item.id;
        this.el.appendChild(cardContainer);
        // WARNING this might break if props include functions
        new ChildClass(cardContainer, { ...item });
      }
    });
    markedToRemove.forEach(oldNode => {
      this.el.removeChild(oldNode);
    });
  }
}

export default Component;
