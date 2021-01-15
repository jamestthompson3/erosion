use std::env::var;

use crate::{
    cards::CardFragment,
    data_structures::{Card, Id, State},
    inboxes::Inbox,
    projects::Project,
};

///FP helpers
fn find_in<T: Id + Clone>(collection: &Vec<T>, predicate: String) -> Option<T> {
    let searched = collection.iter().find(|item| item.id() == predicate);
    match searched {
        Some(result) => Some(result.clone()),
        None => None,
    }
}

fn map_replace<T: Clone + Id>(collection: &Vec<T>, updated: &T) -> Vec<T> {
    collection
        .iter()
        .map(|c| {
            if c.id() == updated.id() {
                return updated;
            }
            c
        })
        .map(|x| x.clone())
        .collect()
}

fn find_project(state: &State, project: String) -> Option<Project> {
    ProjectLens::fold(state, &|projects| {
        find_in(projects.unwrap(), project.to_owned())
    })
}

fn find_inbox(project: &Project, inbox: String) -> Option<Inbox> {
    InboxLens::fold(&project, &|ibox| find_in(ibox.unwrap(), inbox.to_owned()))
}

fn find_card(inbox: &Inbox, card: String) -> Option<Card> {
    CardLens::fold(&inbox, &|cards| find_in(cards.unwrap(), card.to_owned()))
}

fn update_state_projects(state: &State, project: &Project) -> State {
    ProjectLens::set(
        map_replace(ProjectLens::get(state).unwrap(), project),
        state,
    )
}

fn update_project_inboxes(project: &Project, inbox: &Inbox) -> Project {
    InboxLens::set(
        map_replace(InboxLens::get(project).unwrap(), inbox),
        project,
    )
}

fn update_inbox_cards(inbox: &Inbox, card: &Card) -> Inbox {
    CardLens::set(map_replace(CardLens::get(inbox).unwrap(), card), inbox)
}

fn save_state_to_disk(updated: &State) {
    // to prevent flaky tests
    match var("EROSION_ENV") {
        Ok(env) => {
            if env == "test" {
                return;
            }
        }
        Err(_) => {}
    }
    updated.write();
}

#[macro_export]
macro_rules! compose {
    ( $last:expr ) => { $last };
    ( $head:expr, $($tail:expr), +) => {
        compose($head, compose!($($tail),+))
    };
}

#[macro_export]
macro_rules! composeL {
    ( $last:expr ) => { $last };
    ( $head:expr, $($tail:expr), +) => {
        compose_unwrapped($head, compose!($($tail),+))
    };
}

pub fn compose_unwrapped<A, B, C, G, F>(f: F, g: G) -> impl Fn(A) -> C
where
    F: Fn(A) -> Option<B>,
    G: Fn(Option<B>) -> C,
{
    move |x| g(f(x))
}

pub fn compose<A, B, C, G, F>(f: F, g: G) -> impl Fn(A) -> C
where
    F: Fn(A) -> B,
    G: Fn(B) -> C,
{
    move |x| g(f(x))
}

// Data lenses
pub trait Lens<DataStructure, SubpartReturnType> {
    fn over(
        s: &DataStructure,
        f: &dyn Fn(Option<&SubpartReturnType>) -> SubpartReturnType,
    ) -> DataStructure {
        let result: SubpartReturnType = f(Self::get(s));
        Self::set(result, &s)
    }
    fn fold<'a, T>(
        s: &'a DataStructure,
        f: &dyn Fn(Option<&'a SubpartReturnType>) -> Option<T>,
    ) -> Option<T>
    where
        T: 'a,
    {
        f(Self::get(s))
    }
    fn get(s: &DataStructure) -> Option<&SubpartReturnType>;
    fn set(a: SubpartReturnType, s: &DataStructure) -> DataStructure;
}

pub struct InboxLens;
pub struct CardLens;
pub struct ProjectLens;

impl Lens<Project, Vec<Inbox>> for InboxLens {
    fn get(s: &Project) -> Option<&Vec<Inbox>> {
        Some(&s.inboxes)
    }

    fn set(a: Vec<Inbox>, s: &Project) -> Project {
        Project {
            id: s.id.clone(),
            name: s.name.clone(),
            inboxes: a,
        }
    }
}

impl Lens<State, Vec<Project>> for ProjectLens {
    fn get(s: &State) -> Option<&Vec<Project>> {
        Some(&s.projects)
    }
    fn set(a: Vec<Project>, s: &State) -> State {
        State {
            id: String::from("state"),
            version: s.version.clone(),
            user: s.user.clone(),
            projects: a,
        }
    }
}

impl Lens<Inbox, Vec<Card>> for CardLens {
    fn get(s: &Inbox) -> Option<&Vec<Card>> {
        Some(&s.cards)
    }
    fn set(a: Vec<Card>, s: &Inbox) -> Inbox {
        Inbox {
            id: s.id.clone(),
            name: s.name.clone(),
            cards: a,
        }
    }
}

/// Cards: most atomic updates, so there will be a bit of nesting
pub fn update_card(state: &State, project: String, inbox: String, card: Card) -> State {
    let found_project = find_project(state, project).unwrap();
    let found_inbox = find_inbox(&found_project, inbox).unwrap();

    // Now we use the lenses to rebuild the updated state
    let updated_inbox = update_inbox_cards(&found_inbox, &card);
    let updated_project = update_project_inboxes(&found_project, &updated_inbox);
    let updated_state = update_state_projects(&state, &updated_project);
    save_state_to_disk(&updated_state);
    updated_state
}

pub fn create_card(state: &State, project: String, inbox: String, data: CardFragment) -> State {
    let found_project = find_project(state, project).unwrap();
    let found_inbox = find_inbox(&found_project, inbox).unwrap();
    let updated_inbox = CardLens::over(&found_inbox, &|cards| {
        let new_card = Card::create(data.to_owned());
        match cards {
            Some(c) => {
                let mut new_arr = c.clone();
                new_arr.push(new_card);
                new_arr
            }
            None => {
                vec![new_card]
            }
        }
    });
    let updated_project = update_project_inboxes(&found_project, &updated_inbox);
    let updated_state = update_state_projects(state, &updated_project);
    save_state_to_disk(&updated_state);
    updated_state
}

pub fn delete_card(state: &State, project: String, inbox: String, card_id: String) -> State {
    let found_project = find_project(state, project).unwrap();
    let mut found_inbox = find_inbox(&found_project, inbox).unwrap();
    found_inbox.cards = found_inbox
        .cards
        .iter()
        .filter(|c| c.id != card_id)
        .map(|x| x.clone())
        .collect();
    let updated_project = update_project_inboxes(&found_project, &found_inbox);
    let updated_state = update_state_projects(state, &updated_project);
    save_state_to_disk(&updated_state);
    updated_state
}

// Inboxes
pub fn create_inbox(state: &State, project: String, name: &str) -> State {
    let mut found_project = find_project(state, project).unwrap();
    let new_inbox = Inbox::create(name);
    found_project.inboxes.push(new_inbox);
    let updated_state = update_state_projects(state, &found_project);
    save_state_to_disk(&updated_state);
    updated_state
}

pub fn update_inbox(state: &State, project: String, inbox: Inbox) -> State {
    let found_project = find_project(state, project).unwrap();
    let updated_project = update_project_inboxes(&found_project, &inbox);
    let updated_state = update_state_projects(state, &updated_project);
    save_state_to_disk(&updated_state);
    updated_state
}

pub fn delete_inbox(state: &State, project: String, inbox_id: String) -> State {
    let mut found_project = find_project(state, project).unwrap();
    found_project.inboxes = found_project
        .inboxes
        .iter()
        .filter(|ibox| ibox.id != inbox_id)
        .map(|x| x.clone())
        .collect();
    let updated_state = update_state_projects(state, &found_project);
    save_state_to_disk(&updated_state);
    updated_state
}

// Projects
pub fn create_project(state: &State, project_name: &str) -> State {
    let mut new_state = state.clone();
    new_state.projects.push(Project::create(project_name));
    save_state_to_disk(&new_state);
    new_state
}

pub fn update_project(state: &State, project: Project) -> State {
    let updated_state = update_state_projects(state, &project);
    save_state_to_disk(&updated_state);
    updated_state
}

pub fn delete_project(state: &State, project_id: String) -> State {
    let mut new_state = state.clone();
    new_state.projects = new_state
        .projects
        .iter()
        .filter(|x| x.id != project_id)
        .map(|x| x.to_owned())
        .collect();
    save_state_to_disk(&new_state);
    new_state
}

#[cfg(test)]
mod tests {
    use crate::{bootstrap::bootstrap_tests, cards::CardFragment, data_structures::CardStatus};

    use super::*;
    #[test]
    fn lenses_get() {
        let mut test_proj = Project::create("test");
        let mut testbx = Inbox::create("test1");
        test_proj.inboxes.push(testbx.clone());
        let boxes = InboxLens::get(&test_proj);
        assert_eq!(boxes, Some(&vec!(testbx.clone())));
        let card = Card::create(CardFragment {
            scheduled: None,
            status: CardStatus::InProgress,
            tags: None,
            text: Some(String::from("cool test text")),
            title: String::from("Title card"),
            time_allotted: 0,
        });
        testbx.cards.push(card.clone());
        let cards = CardLens::get(&testbx);
        assert_eq!(cards, Some(&vec!(card)));
    }
    #[test]
    fn lenses_over() {
        let mut test_proj = Project::create("test");
        test_proj.inboxes.push(Inbox::create("testing again"));
        let cap_name = InboxLens::over(&test_proj, &|b: Option<&Vec<Inbox>>| match b {
            Some(boxes) => {
                return boxes
                    .iter()
                    .map(|b| Inbox {
                        id: b.id.clone(),
                        cards: b.cards.clone(),
                        name: b.name.to_uppercase(),
                    })
                    .collect();
            }
            None => panic!(":/"),
        });
        assert_ne!(cap_name, test_proj);
    }
    #[test]
    fn lenses_fold() {
        let mut testbx = Inbox::create("test1");

        let card = Card::create(CardFragment {
            scheduled: None,
            status: CardStatus::InProgress,
            tags: None,
            text: Some(String::from("cool test text")),
            title: String::from("Title card"),
            time_allotted: 0,
        });
        testbx.cards.push(card.clone());
        let folded_card = CardLens::fold(&testbx, &|cards| match cards {
            Some(card_vec) => Some(card_vec.iter().find(|c| c.id == card.id).unwrap().clone()),
            None => None,
        });
        assert_eq!(folded_card, Some(card));
    }
    #[test]
    fn lenses_create_card() {
        let state = bootstrap_tests().unwrap();
        let test_proj = ProjectLens::get(&state).unwrap().first().unwrap();
        let test_inbox = InboxLens::get(test_proj).unwrap().first().unwrap();
        let card_frag = CardFragment {
            scheduled: None,
            status: CardStatus::InProgress,
            tags: None,
            text: Some(String::from("cool test text")),
            title: String::from("Title card"),
            time_allotted: 0,
        };
        let updated_state = create_card(
            &state,
            test_proj.id.clone(),
            test_inbox.id.clone(),
            card_frag,
        );
        assert_ne!(state, updated_state);
        let new_cards = InboxLens::get(ProjectLens::get(&updated_state).unwrap().first().unwrap())
            .unwrap()
            .first()
            .unwrap();
        let found_card = new_cards
            .cards
            .iter()
            .find(|c| c.text == Some(String::from("cool test text")))
            .unwrap();
        assert_eq!(found_card.text, Some(String::from("cool test text")));
        assert_eq!(found_card.title, String::from("Title card"));
    }
    #[test]
    fn lenses_update_card() {
        let state = bootstrap_tests().unwrap();
        let test_proj = ProjectLens::get(&state).unwrap().first().unwrap();
        let test_inbox = InboxLens::get(test_proj).unwrap().first().unwrap();
        let mut found_card = test_inbox.cards.first().unwrap().to_owned();
        found_card.title = String::from("mutated title");
        let updated_state = update_card(
            &state,
            test_proj.id.to_owned(),
            test_inbox.id.to_owned(),
            found_card.clone(),
        );
        let updated_card = find_card(
            &find_inbox(
                &find_project(&updated_state, test_proj.id.to_owned()).unwrap(),
                test_inbox.id.to_owned(),
            )
            .unwrap(),
            found_card.id.to_owned(),
        )
        .unwrap();
        assert_eq!(updated_card.title, String::from("mutated title"));
        assert_ne!(updated_card, test_inbox.cards.first().unwrap().clone());
    }
    #[test]
    fn lenses_delete_card() {
        let state = bootstrap_tests().unwrap();
        let project = state.projects.first().unwrap();
        let inbox = project.inboxes.first().unwrap();
        let card = inbox.cards.first().unwrap();
        let updated_state = delete_card(
            &state,
            project.id.clone(),
            inbox.id.clone(),
            card.id.clone(),
        );
        let new_card = find_card(
            &find_inbox(
                &find_project(&updated_state, project.id.to_owned()).unwrap(),
                inbox.id.to_owned(),
            )
            .unwrap(),
            card.id.to_owned(),
        );
        assert_eq!(new_card, None);
    }
    #[test]
    fn lenses_create_inbox() {
        let state = bootstrap_tests().unwrap();
        let test_proj = ProjectLens::get(&state).unwrap().first().unwrap();
        let updated_state = create_inbox(&state, test_proj.id.to_owned(), "cool");
        let updated_proj = find_project(&updated_state, test_proj.id.to_owned()).unwrap();
        assert_ne!(updated_state, state);
        assert_eq!(updated_proj.inboxes.len(), 2);
    }
    #[test]
    fn lenses_update_inbox() {
        let state = bootstrap_tests().unwrap();
        let test_proj = ProjectLens::get(&state).unwrap().first().unwrap();
        let mut test_inbox = test_proj.inboxes.first().unwrap().to_owned();
        test_inbox.name = String::from("changed");
        let updated_state = update_inbox(&state, test_proj.id.to_owned(), test_inbox);
        let updated_proj = find_project(&updated_state, test_proj.id.to_owned()).unwrap();
        assert_ne!(updated_state, state);
        assert_eq!(
            updated_proj.inboxes.first().unwrap().name,
            String::from("changed")
        );
    }
    #[test]
    fn lenses_delete_inbox() {
        let state = bootstrap_tests().unwrap();
        let proj = ProjectLens::get(&state).unwrap().first().unwrap();
        let inbox = proj.inboxes.first().unwrap();
        let updated_state = delete_inbox(&state, proj.id.clone(), inbox.id.clone());
        assert_ne!(updated_state, state);
        let updated_proj = find_project(&updated_state, proj.id.to_owned()).unwrap();
        assert_eq!(updated_proj.inboxes.len(), 0);
    }
    #[test]
    fn lenses_create_project() {
        let state = bootstrap_tests().unwrap();
        let updated_state = create_project(&state, "test_proj");
        assert_ne!(updated_state, state);
        assert_eq!(updated_state.projects.len(), 2);
    }
    #[test]
    fn lenses_update_project() {
        let state = bootstrap_tests().unwrap();
        let mut proj = state.projects.first().unwrap().to_owned();
        proj.name = String::from("updated");
        let updated_state = update_project(&state, proj.clone());
        assert_ne!(updated_state, state);
        assert_eq!(updated_state.projects.first().unwrap().to_owned(), proj);
    }
    #[test]
    fn lenses_delete_project() {
        let state = bootstrap_tests().unwrap();
        let proj = state.projects.first().unwrap().to_owned();
        let updated_state = delete_project(&state, proj.id);
        assert_ne!(updated_state, state);
        assert_eq!(updated_state.projects.len(), 0);
    }
}
