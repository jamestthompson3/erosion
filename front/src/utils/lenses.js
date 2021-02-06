import { appContext, kby } from "../messages";
/**
 * Operates on State
 * set operations take Project[]
 */
function ProjectLens() {
  return {
    get: (state) => state.projects,
    set: (projects, state) => ({ ...state, projects }),
    fold: (state, fn) => fn(this.get(state)),
    over: (state, fn) => {
      const result = fn(this.get(state));
      this.set(result);
    },
  };
}

/**
 * Operates on a Project
 * set operations take Inbox[]
 */
function InboxLens() {
  return {
    get: (project) => project.inboxes,
    set: (inboxes, project) => ({ ...project, inboxes }),
    fold: (project, fn) => fn(this.get(project)),
    over: (project, fn) => {
      const result = fn(this.get(project));
      this.set(result);
    },
  };
}

/**
 * Operates on an Inbox
 * set operations take Card[]
 */
function CardLens() {
  return {
    get: (inbox) => inbox.cards,
    set: (cards, inbox) => ({ ...inbox, cards }),
    fold: (inbox, fn) => fn(this.get(inbox)),
    over: (inbox, fn) => {
      const result = fn(this.get(inbox));
      this.set(result);
    },
  };
}

export function compose(lensA, lensB) {
  return {
    get: (data) => lensB.get(lensA.get(data)),
    set: (data) => lensB.set(lensA.set(data)),
  };
}

export const projects = ProjectLens();
export const inboxes = InboxLens();
export const cards = CardLens();

export function findProject(id, state) {
  const stateProjects = projects.get(state);
  return stateProjects.find((project) => project.id === id);
}

export function findInbox(id, project) {
  const projectInboxes = inboxes.get(project);
  return projectInboxes.find((inbox) => inbox.id === id);
}

export function findCard(id, inbox) {
  const inboxCards = cards.get(inbox);
  return inboxCards.find((inbox) => inbox.id === id);
}

/**
 * @param project: {Inbox} - inbox
 * @param  project: {Card} - card
 * @returns Inbox
 */
export function updateInboxCards(inbox, card) {
  return cards.set(mapReplace(cards.get(inbox), card), inbox);
}

/**
 * @param project: {Project} - project
 * @param  project: {Inbox} - Inbox
 * @returns Project
 */
export function updateProjectInboxes(project, inbox) {
  return inboxes.set(mapReplace(inboxes.get(project), inbox), project);
}

/**
 * @param state: {State} - global state
 * @param  project: {Project} - project
 * @returns State
 */
export function updateStateProjects(state, project) {
  return projects.set(mapReplace(projects.get(state), project), state);
}

function mapReplace(collection, updated) {
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
      state,
      updateStateProjects(state, updatedSrc),
      updatedDest
    );
    const cardKeyed = kby(updatedState.projects);
    appContext.set("cardKeyed", cardKeyed);
    appContext.set("state", updatedState);
  }
}

export function updateCard(updatePayload) {
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

export function removeInbox(updatePayload) {
  const { project, inbox } = updatePayload;
  const state = appContext.get("state");
  const foundProject = findProject(project, state);
  const updatedState = updateStateProjects(state, {
    ...foundProject,
    inboxes: foundProject.inboxes.filter((box) => box.id !== inbox),
  });
  appContext.set("state", updatedState);
}

export function removeProject(updatePayload) {
  const { project_id } = updatePayload;
  appContext.set("state", {
    ...state,
    projects: state.projects.filter((p) => p.id !== project_id),
  });
}

export function removeCard(updatePayload) {
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
