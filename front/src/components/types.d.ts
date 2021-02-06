enum MenuSelectPosition {
  Fixed = "fixed",
  FixedRight = "fixed-right"
}

export interface MenuSelectProps {
  trigger(a: any): string;
  children: {
    render(): string;
    boostrap(menu: HTMLElement): void;
  };
  position: MenuSelectPosition;
}
