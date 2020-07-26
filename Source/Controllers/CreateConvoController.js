import UserModel from "../Models/UserModel";
import ConvoModel from "../Models/ConvoModel";

async function create(question, uid) {
  const pending_convo = await ConvoModel.shared.create(question, uid);

  // UserModel.shared.addConvo(question, uid, "0" + pending_convo.id);
  return pending_convo;
}

export default { create };
