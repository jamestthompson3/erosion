function ProjectLens() {
  return {
    get: state => state.projects,
    set: (projects, state) => ({ ...state, projects }),
    fold: (state, fn) => fn(this.get(state)),
    over: (state, fn) => {
      const result = fn(this.get(state));
      this.set(result);
    }
  };
}

function InboxLens() {
  return {
    get: project => project.inboxes,
    set: (inboxes, project) => ({ ...project, inboxes }),
    fold: (project, fn) => fn(this.get(project)),
    over: (project, fn) => {
      const result = fn(this.get(project));
      this.set(result);
    }
  };
}

function CardLens() {
  return {
    get: inbox => inbox.cards,
    set: (cards, inbox) => ({ ...inbox, cards }),
    fold: (inbox, fn) => fn(this.get(inbox)),
    over: (inbox, fn) => {
      const result = fn(this.get(inbox));
      this.set(result);
    }
  };
}

export function compose(lensA, lensB) {
  return {
    get: data => lensB.get(lensA.get(data)),
    set: data => lensB.set(lensA.set(data))
  };
}

export const projects = ProjectLens();
export const inboxes = InboxLens();
export const cards = CardLens();

export function findProject(id, state) {
  const stateProjects = projects.get(state);
  return stateProjects.find(project => project.id === id);
}

export function findInbox(id, project) {
  const projectInboxes = inboxes.get(project);
  return projectInboxes.find(inbox => inbox.id === id);
}

export function findCard(id, inbox) {
  const inboxCards = cards.get(inbox);
  return inboxCards.find(inbox => inbox.id === id);
}

export function updateInboxCards(inbox, card) {
  return cards.set(mapReplace(cards.get(inbox), card), inbox);
}

export function updateProjectInboxes(project, inbox) {
  return inboxes.set(mapReplace(inboxes.get(project), inbox), project);
}

export function updateStateProjects(state, project) {
  return projects.set(mapReplace(projects.get(state), project), state);
}

function mapReplace(collection, updated) {
  return collection.map(item => (item.id === updated.id ? updated : item));
}
