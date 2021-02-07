export enum MenuSelectPosition {
  Fixed = "fixed",
  FixedRight = "fixed-right",
}

type ModalMenuTrigger = (() => string) | null;
export interface ModalMenuProps {
  trigger: ModalMenuTrigger;
  children: {
    render(): string;
    bootstrap(menu: HTMLElement, onClose: () => void): void;
  };
  position?: MenuSelectPosition;
}
