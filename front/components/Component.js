/**
 * @typedef {Object} HasId
 * @property {string} id - id for item
 */

class Component {
  constructor(parent, props = {}) {
    this.parent = parent;
    parent.withProps = this.withProps;
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
   * @param {string} querySelector - querySelector class string like ".card.container"
   * @param {Record<string, HasId>[]} dataset  - a data set whose items implement the HasId interface
   * @param {Function} ChildClass - a class that instantiates the component's children
   */
  sweepAndUpdate(querySelector, dataset, ChildClass) {
    const children = this.parent.querySelectorAll(querySelector);
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
        childToUpdate.withProps({ ...item });
      } else {
        const cardContainer = document.createElement("div");
        cardContainer.classList.add(
          ...querySelector.split(".").filter(Boolean)
        );
        cardContainer.dataset.key = item.id;
        this.parent.appendChild(cardContainer);
        new ChildClass(cardContainer, { ...item });
      }
    });
    markedToRemove.forEach(oldNode => {
      this.parent.removeChild(oldNode);
    });
  }
}

export default Component;
