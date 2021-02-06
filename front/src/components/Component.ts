interface CustomElement extends HTMLElement {
  withProps(next: any): void;
}

interface CustomComponent {
  el: CustomElement;
  props: Record<string, any>;
  update(props?: Record<string, any>): void;
  setState(next?: Record<string, any>): void;
  withProps(next?: Record<string, any>): void;
}

class Component implements CustomComponent {
  el: CustomElement;
  props: Record<string, any>;
  update: () => void;
  state: Record<string, any>;
  constructor(el: CustomElement, props = {}) {
    this.el = el;
    el.withProps = this.withProps;
    this.props = props;
  }
  setState(next: Record<string, any>) {
    Object.assign(this.state, next);
    this.update();
  }
  withProps = (next: Record<string, any>) => {
    Object.assign(this.props, next);
    this.update();
  };
}

export default Component;
