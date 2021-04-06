import { appContext, messages, postData } from "../../messages";

import { Inbox } from "../../types.d";

class InboxModel {
  inbox: Inbox;
  constructor(args: Inbox) {
    this.inbox = args;
  }

  updateField = (updatedData: Partial<Inbox>): Inbox => {
    const { inbox } = this;
    const keyedInbox = appContext.get("inboxKeyed")[inbox.id];
    const { project } = keyedInbox;
    const updated = { ...inbox, ...updatedData };
    postData(messages.UpdateInbox, {
      project,
      inbox: updated,
    });
    return updated;
  };

  delete = () => {
    const { inbox } = this;

    const keyedInbox = appContext.get("inboxKeyed")[inbox.id];
    const { project } = keyedInbox;
    const confirmed = confirm(`Delete Inbox ${inbox.name}?`);
    confirmed &&
      postData(messages.DeleteInbox, {
        project,
        inbox: inbox.id,
      });
  };
}

export default InboxModel;
