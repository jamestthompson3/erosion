interface State {
  user: string;
  id: string;
  version: string;
  projects: Project[];
}

interface Project {
  id: string;
  name: string;
  inboxes: Inbox[];
}

interface Inbox {
  id: string;
  name: string;
  cards: Card[];
}

interface Card {
  id: string;
  title: string;
  created: string;
  modified: string;
  modifier: string;
  status: CardStatus;
  scheduled?: string;
  tags?: string[];
  text?: string;
  completed?: string;
}

export enum CardStatus {
  Todo = "Todo",
  InProgress = "InProgress",
  Done = "Done",
}

interface Settings {
  user: string;
  id: "settings";
  show_complete: boolean;
}

export type DeleteCardPayload = {
  inbox: string;
  project: string;
  card: string;
};

export type UpdateCardPayload = {
  inbox: string;
  project: string;
  card: Card;
};

export type DeleteInboxPayload = {
  inbox: string;
  project: string;
};

export type DeleteProjectPayload = {
  project_id: string;
};

export type MoveCardPayload = {
  card_id: string;
  instructions: {
    inbox: {
      src: string;
      dest: string;
    };
    project: {
      src: string;
      dest: string;
    };
  };
};

export type WorkspaceInitPayload = {
  settings: Settings;
  state: State;
};
