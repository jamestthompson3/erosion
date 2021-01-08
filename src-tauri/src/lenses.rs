use crate::{
    cards::CardFragment,
    data_structures::{Card, Id, State},
    filesystem::write_data_file,
    inboxes::Inbox,
    projects::Project,
};

///FP helpers
///
fn find_in<T: Id + Clone>(collection: &Vec<T>, predicate: String) -> T {
    let searched = collection.iter().find(|item| item.id() == predicate);
    match searched {
        Some(result) => result.clone(),
        None => panic!(format!("Cannot find result with predicate: {}", predicate)),
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
        Some(find_in(projects.unwrap(), project.to_owned()))
    })
}

fn find_inbox(project: &Project, inbox: String) -> Option<Inbox> {
    InboxLens::fold(&project, &|ibox| {
        Some(find_in(ibox.unwrap(), inbox.to_owned()))
    })
}

fn find_card(inbox: &Inbox, card: Card) -> Option<Card> {
    CardLens::fold(&inbox, &|cards| {
        Some(find_in(cards.unwrap(), card.id.clone()))
    })
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
    let found_card = find_card(&found_inbox, card).unwrap();

    // Now we use the lenses to rebuild the updated state
    let updated_inbox = CardLens::set(
        map_replace(CardLens::get(&found_inbox).unwrap(), &found_card),
        &found_inbox,
    );
    let updated_project = InboxLens::set(
        map_replace(InboxLens::get(&found_project).unwrap(), &updated_inbox),
        &found_project,
    );
    let updated_state = ProjectLens::set(
        map_replace(ProjectLens::get(&state).unwrap(), &updated_project),
        state,
    );
    write_data_file("state", &serde_json::to_string(&updated_state).unwrap()).unwrap();
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
    let updated_project = InboxLens::set(
        map_replace(InboxLens::get(&found_project).unwrap(), &updated_inbox),
        &found_project,
    );
    let updated_state = ProjectLens::set(
        map_replace(ProjectLens::get(state).unwrap(), &updated_project),
        state,
    );
    write_data_file("state", &serde_json::to_string(&updated_state).unwrap()).unwrap();
    updated_state
}

// Inboxes
pub fn create_inbox(state: &State, project: String, name: &str) -> State {
    let mut found_project = find_project(state, project).unwrap();
    let new_inbox = Inbox::create(name);
    found_project.inboxes.push(new_inbox);
    let updated_state = ProjectLens::set(
        map_replace(ProjectLens::get(state).unwrap(), &found_project),
        state,
    );
    write_data_file("state", &serde_json::to_string(&updated_state).unwrap()).unwrap();
    updated_state
}

#[cfg(test)]
mod tests {
    use crate::{
        bootstrap::bootstrap, cards::CardFragment, data_structures::CardStatus,
        filesystem::read_data_file,
    };

    use super::*;
    #[test]
    fn lenses_get() {
        let mut test_proj = Project::create("test");
        let mut testbx = test_proj.create_inbox("test1");
        let boxes = InboxLens::get(&test_proj);
        assert_eq!(boxes, Some(&vec!(testbx.clone())));
        let card = Card::create(CardFragment {
            scheduled: None,
            status: CardStatus::InProgress,
            tag: None,
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
        let _testbx = test_proj.create_inbox("test1");
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
        let mut test_proj = Project::create("test");
        let mut testbx = test_proj.create_inbox("test1");

        let card = Card::create(CardFragment {
            scheduled: None,
            status: CardStatus::InProgress,
            tag: None,
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
    fn updaters() {
        bootstrap();
        let state: State = serde_json::from_str(&read_data_file("state").unwrap()).unwrap();
        let test_proj = ProjectLens::get(&state).unwrap().first().unwrap();
        let test_inbox = InboxLens::get(test_proj).unwrap().first().unwrap();
        let card_frag = CardFragment {
            scheduled: None,
            status: CardStatus::InProgress,
            tag: None,
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
        let new_cards = InboxLens::get(ProjectLens::get(&state).unwrap().first().unwrap())
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
}
