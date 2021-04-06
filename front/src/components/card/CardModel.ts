import { Card, CardStatus } from "../../types.d";
import { appContext, messages, postData } from "../../messages";

class CardModel {
  card: Card;
  constructor(args: Card) {
    this.card = args; // copy since we want changes to be localized to this specific instance
  }
  log() {
    console.log(this);
  }
  updateField = (updatedData: Partial<Card>): Card => {
    const { id, scheduled } = this.card;
    const keyedCard = appContext.get("cardKeyed")[id];
    const { inbox, project } = keyedCard;
    const updated = {
      ...this.card,
      ...updatedData,
      modified: new Date().toString(),
    };
    if (updatedData.scheduled) {
      const today = new Date();
      const prevScheduled = new Date(scheduled);
      const newScheduled = new Date(updatedData.scheduled);
      if (today.toDateString() === newScheduled.toDateString()) {
        // update the dueToday list if we've scheduled the card for today
        const dueToday = appContext.get("dueToday");
        appContext.set("dueToday", {
          ...dueToday,
          cards: dueToday.cards.concat(updated),
        });
      }
      if (
        today.toDateString() === prevScheduled.toDateString() &&
        today.toDateString() !== newScheduled.toDateString()
      ) {
        //or if we've moved it from today to another day
        const dueToday = appContext.get("dueToday");
        appContext.set("dueToday", {
          ...dueToday,
          cards: dueToday.cards.filter((card: Card) => card.id === updated.id),
        });
      }
    }
    postData(messages.UpdateCard, {
      inbox,
      project,
      card: updated,
    });
    return updated;
  };
  deleteCard = () => {
    const { id } = this.card;
    const keyedByCard = appContext.get("cardKeyed")[id];
    const { inbox, project } = keyedByCard;
    postData(messages.DeleteCard, {
      inbox,
      project,
      card: id,
    });
  };
  updateStatus = () => {
    const { status } = this.card;
    switch (status) {
      case "Done":
        return this.updateField({ status: CardStatus.Todo, completed: null });
      case "Todo":
        return this.updateField({ status: CardStatus.InProgress });
      case "InProgress":
        return this.updateField({
          status: CardStatus.Done,
          completed: new Date().toString(),
        });
      default:
        return this.card;
    }
  };
}

export default CardModel;
