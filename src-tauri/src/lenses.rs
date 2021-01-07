use crate::{data_structures::{Card, CardBase, Id, State}, filesystem::write_data_file, inboxes::Inbox, projects::Project};

// FP helpers
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
    G: Fn(B) -> C,
{
    move |x| g(f(x).unwrap())
}

pub fn compose<A, B, C, G, F>(f: F, g: G) -> impl Fn(A) -> C
where
    F: Fn(A) -> B,
    G: Fn(B) -> C,
{
    move |x| g(f(x))
}

// Data lenses
// Lens<WholeDataStructure, SubpartReturnType>
pub trait Lens<DataStructure, SubpartReturnType>
{
    fn over(s: &DataStructure, f: &dyn Fn(Option<&SubpartReturnType>) -> SubpartReturnType) -> DataStructure
    {
        let result: SubpartReturnType = f(Self::get(s));
        Self::set(result, &s)
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

  fn set(a: Vec<Inbox>, s: &Project) ->  Project {
      Project {
        id: s.id.clone(),
        name: s.name.clone(),
        inboxes: a
  }
}}

impl Lens<State, Vec<Project>> for ProjectLens {
    fn get(s: &State) -> Option<&Vec<Project>> {
       Some(&s.projects)
    }
    fn set(a: Vec<Project>, s: &State) -> State {
        State {
            id: String::from("state"),
            version: s.version.clone(),
            user: s.user.clone(),
            projects: a
        }
    }
}

      // let mut inboxes: Vec<Inbox> = s.inboxes.iter().filter(|ibox| ibox.id != a.id).map(|b| b.to_owned()).collect();
// inboxes.push(a);

impl Lens<Inbox, Vec<Card>> for CardLens {
    fn get(s: &Inbox) -> Option<&Vec<Card>> {
        Some(&s.cards)
    }
    fn set(a: Vec<Card>, s: &Inbox) -> Inbox {
        Inbox {
            id: s.id.clone(),
            name: s.name.clone(),
            cards: a
        }
    }
}

// most atomic update, so there will be a bit of nesting
pub fn update_card(state: &State, project: String, inbox: String, card: Card) -> State {
    let projects = ProjectLens::get(state);
    let found_project = match projects {
        Some(p) => {p.iter().find(|proj| proj.id == project).unwrap()}
        None => panic!("Cannot save card, no project found")
    };
    let inboxes = InboxLens::get(&found_project);
    let found_inbox = match inboxes {
        Some(i) => {i.iter().find(|b| b.id == inbox).unwrap()}
        None => panic!("Cannot save card, no inbox found")
    };
    let cards = CardLens::get(&found_inbox);
    let found_card = match cards {
        Some(c) => {c.iter().find(|ca| {
            ca.id == card.id
        }).unwrap()}
        None => panic!("Cannot save card, no cards found")
        };
    // Now we use the lenses to rebuild the updated state
    let updated_inbox = CardLens::set(map_collection(cards.unwrap(), found_card), &found_inbox);
    let updated_project = InboxLens::set(map_collection(inboxes.unwrap(), &updated_inbox), &found_project);
    let updated_state = ProjectLens::set(map_collection(projects.unwrap(), &updated_project), state);
    write_data_file("state", &serde_json::to_string(&updated_state).unwrap()).unwrap();
    updated_state
}

fn map_collection<T: Clone + Id>(collection: &Vec<T>, updated: &T) -> Vec<T>
{
    collection.iter().map(|c|{
        if c.id() == updated.id() {
            return updated
        }
        c
    }).map(|x| x.clone()).collect()
}


#[cfg(test)]
mod tests {
    use crate::{cards::CardFragment, data_structures::CardStatus};

    use super::*;
    #[test]
    fn lenses_get() {
        let mut test_proj = Project::create("test");
        let mut testbx = test_proj.create_inbox("test1");
        let boxes = InboxLens::get(&test_proj);
        assert_eq!(boxes, Some(&vec!(testbx.clone())));
        let card = testbx.create_card(CardFragment {
     scheduled: None,
     status: CardStatus::InProgress,
     tag: None,
     text: Some(String::from("cool test text")),
     title: String::from("Title card"),
     time_allotted: 0,
        });
    let cards = CardLens::get(&testbx);
    assert_eq!(cards, Some(&vec!(card)));
}
#[test]
fn lenses_over() {
        let mut test_proj = Project::create("test");
        let _testbx = test_proj.create_inbox("test1");
        let cap_name = InboxLens::over(&test_proj, &|b: Option<&Vec<Inbox>>| {
            match b {
                Some(boxes) =>  {
                    return boxes.iter().map(|b| {
                        Inbox {
                        id: b.id.clone(),
                        cards: b.cards.clone(),
                        name: b.name.to_uppercase()
                        }}).collect();
                }
                None => panic!(":/")
            }
        });
        assert_ne!(cap_name, test_proj);
}}
