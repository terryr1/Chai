import ConvoModel from "../Models/ConvoModel";
import PendingConvoModel from "../Models/PendingConvoModel";
import UserModel from "../Models/UserModel";

async function start(callback, id, switchState) {
  PendingConvoModel.shared.on(callback, id, switchState);
}

async function send(messages, id) {
  return PendingConvoModel.shared.send(messages, id);
}

async function stop(id) {
  await PendingConvoModel.shared.off(id);
}

async function deleteConvo(uid, id) {
  const convo_id = "0" + id;
  await UserModel.shared.removeConvo(uid, convo_id);
  await PendingConvoModel.shared.delete(id);
}

async function switchPendingStateToThis(uid, id) {
  const pending_convo_id = "0" + id;
  const convo_id = "10" + id;

  const convo = await ConvoModel.shared.get(id);
  UserModel.shared.removeConvo(uid, convo_id);
  ConvoModel.shared.delete(id);
  PendingConvoModel.shared.createFromOld(convo, id);
  UserModel.shared.addConvo(convo.question, uid, pending_convo_id);
}

export default { start, stop, send, switchPendingStateToThis, deleteConvo };
