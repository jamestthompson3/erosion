class Component {
  constructor(parent, props) {
    this.parent = parent;
    this.props = props;
  }
  setState(next) {
    Object.assign(this.state, next);
    this.update();
  }
}

export default Component;
