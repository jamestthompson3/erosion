import { appContext, kby } from "../messages";
import {
  State,
  Project,
  Inbox,
  Card,
  UpdateCardPayload,
  DeleteInboxPayload,
  DeleteProjectPayload,
  DeleteCardPayload,
} from "../types";

interface PartialLens<DataStructure, SubpartReturnType> {
  get(s: DataStructure): SubpartReturnType;
  set(a: SubpartReturnType, s: DataStructure): DataStructure;
}
interface Lens<DataStructure, SubpartReturnType>
  extends PartialLens<DataStructure, SubpartReturnType> {
  fold<T>(a: SubpartReturnType, fn: (a: SubpartReturnType) => T): T;
  over(
    a: DataStructure,
    fn: (s: SubpartReturnType) => SubpartReturnType
  ): DataStructure;
}

/**
 * Operates on State
 */
function ProjectLens(): Lens<State, Project[]> {
  return {
    get: (state) => state.projects,
    set: (projects, state) => ({ ...state, projects }),
    fold: (state, fn) => fn(this.get(state)),
    over: (state, fn) => {
      const result = fn(this.get(state));
      return this.set(result);
    },
  };
}

/**
 * Operates on a Project
 */
function InboxLens(): Lens<Project, Inbox[]> {
  return {
    get: (project) => project.inboxes,
    set: (inboxes, project) => ({ ...project, inboxes }),
    fold: (project, fn) => fn(this.get(project)),
    over: (project, fn) => {
      const result = fn(this.get(project));
      return this.set(result);
    },
  };
}

/**
 * Operates on an Inbox
 */
function CardLens(): Lens<Inbox, Card[]> {
  return {
    get: (inbox) => inbox.cards,
    set: (cards, inbox) => ({ ...inbox, cards }),
    fold: (inbox, fn) => fn(this.get(inbox)),
    over: (inbox, fn) => {
      const result = fn(this.get(inbox));
      return this.set(result);
    },
  };
}

export function compose<A, B, C>(
  lensA: Lens<A, B>,
  lensB: Lens<B, C>
): PartialLens<A, C> {
  return {
    get: (data) => lensB.get(lensA.get(data)),
    set: (dataset, updatePiece) =>
      lensA.set(lensB.set(dataset, lensA.get(updatePiece)), updatePiece),
  };
}

export const projects = ProjectLens();
export const inboxes = InboxLens();
export const cards = CardLens();

export function findProject(id: string, state: State) {
  const stateProjects = projects.get(state);
  return stateProjects.find((project) => project.id === id);
}

export function findInbox(id: string, project: Project) {
  const projectInboxes = inboxes.get(project);
  return projectInboxes.find((inbox) => inbox.id === id);
}

export function findCard(id: string, inbox: Inbox) {
  const inboxCards = cards.get(inbox);
  return inboxCards.find((inbox) => inbox.id === id);
}

export function updateInboxCards(inbox: Inbox, card: Card): Inbox {
  return cards.set(mapReplace(cards.get(inbox), card), inbox);
}

export function updateProjectInboxes(project: Project, inbox: Inbox): Project {
  return inboxes.set(mapReplace(inboxes.get(project), inbox), project);
}

export function updateStateProjects(state: State, project: Project): State {
  return projects.set(mapReplace(projects.get(state), project), state);
}

type HasId = Record<"id", string>;
type Mappable<T> = T & HasId;

function mapReplace<T>(collection: Mappable<T>[], updated: Mappable<T>) {
  return collection.map((item) => (item.id === updated.id ? updated : item));
}

export function moveCard({ card_id, instructions: { inbox, project } }) {
  const state = appContext.get("state");
  const srcProject = findProject(project.src, state);
  const destProject = findProject(project.dest, state);
  const srcInbx = findInbox(inbox.src, srcProject);
  const destInbx = findInbox(inbox.dest, destProject);
  const foundCard = findCard(card_id, srcInbx);
  const updatedInbox = {
    ...srcInbx,
    cards: srcInbx.cards.filter((c) => c.id !== card_id),
  };
  const updatedDest = {
    ...destInbx,
    cards: destInbx.cards.concat(foundCard),
  };
  if (srcInbx.id === destInbx.id) {
    return;
  }
  if (project.src === project.dest) {
    const updatedProject = updateProjectInboxes(
      updateProjectInboxes(srcProject, updatedInbox),
      updatedDest
    );
    const updatedState = updateStateProjects(state, updatedProject);
    const cardKeyed = kby(updatedState.projects);
    appContext.set("cardKeyed", cardKeyed);
    appContext.set("state", updatedState);
  } else {
    const updatedSrc = updateProjectInboxes(srcProject, srcInbx);
    const updatedDest = updateProjectInboxes(destProject, destInbx);
    const updatedState = updateStateProjects(
      updateStateProjects(state, updatedSrc),
      updatedDest
    );
    const cardKeyed = kby(updatedState.projects);
    appContext.set("cardKeyed", cardKeyed);
    appContext.set("state", updatedState);
  }
}

export function updateCard(updatePayload: UpdateCardPayload) {
  const { project, inbox, card } = updatePayload;
  const state = appContext.get("state");
  const foundProject = findProject(project, state);
  const foundInbox = findInbox(inbox, foundProject);
  appContext.set(
    "state",
    updateStateProjects(
      state,
      updateProjectInboxes(foundProject, updateInboxCards(foundInbox, card))
    )
  );
}

export function removeInbox(updatePayload: DeleteInboxPayload) {
  const { project, inbox } = updatePayload;
  const state = appContext.get("state");
  const foundProject = findProject(project, state);
  const updatedState = updateStateProjects(state, {
    ...foundProject,
    inboxes: foundProject.inboxes.filter((box) => box.id !== inbox),
  });
  appContext.set("state", updatedState);
}

export function removeProject(updatePayload: DeleteProjectPayload) {
  const { project_id } = updatePayload;
  const state = appContext.get("state");
  appContext.set("state", {
    ...state,
    projects: state.projects.filter((p: Project) => p.id !== project_id),
  });
}

export function removeCard(updatePayload: DeleteCardPayload) {
  const { project, inbox, card } = updatePayload;
  const state = appContext.get("state");
  const foundProject = findProject(project, state);
  const foundInbox = findInbox(inbox, foundProject);
  const updatedState = updateStateProjects(
    state,
    updateProjectInboxes(foundProject, {
      ...foundInbox,
      cards: foundInbox.cards.filter((c) => c.id !== card),
    })
  );
  appContext.set("state", updatedState);
}
