export interface CustomElement extends HTMLElement {
  withProps(next: any): void;
}

export interface CustomComponent {
  el: CustomElement;
  props: Record<string, any>;
  update(props?: Record<string, any>): void;
  setState(next?: Record<string, any>): void;
  withProps(next?: Record<string, any>): void;
}

class Component implements CustomComponent {
  public el: CustomElement;
  props: Record<string, any>;
  public update: () => void;
  state: Record<string, any>;
  constructor(el: HTMLElement, props = {}) {
    // @ts-ignore
    el.withProps = this.withProps;
    this.el = el as CustomElement;
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

// class ExtendedElement extends HTMLElement {
//   constructor(withProps: (next: Record<string, any>) => void) {
//     super();
//     this.withProps = withProps;
//   }
//   withProps(_next?: any) {}
// }

export default Component;
