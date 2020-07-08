import UserModel from "../Models/UserModel";
import PendingConvoModel from "../Models/PendingConvoModel";

async function create(question, uid) {
  const pending_convo = await PendingConvoModel.shared.create(question, uid);

  let pending_id = "0" + pending_convo.id;
  UserModel.shared.addConvo(question, uid, pending_id);
  return pending_convo.id;
}

export default { create };
