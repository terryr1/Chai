import ConvoModel from "../Models/ConvoModel";
import PendingConvoModel from "../Models/PendingConvoModel";
import UserModel from "../Models/UserModel";

async function start(callback, id, switchState) {
  ConvoModel.shared.on(callback, id, switchState);
}

async function send(messages, id) {
  return ConvoModel.shared.send(messages, id);
}

async function stop(id) {
  await ConvoModel.shared.off(id);
}

async function get(id) {
  const convo = await ConvoModel.shared.get(id);
  return convo;
}

async function deleteConvo(uid, id, primary) {
  const primary_id = primary ? "0" + id : "1" + id;
  const convo_id = "1" + primary_id;
  await UserModel.shared.removeConvo(uid, convo_id);
  await ConvoModel.shared.delete(id);
}

async function switchPendingStateToThis(uid, id) {
  const non_primary_convo_id = "11" + id;
  const primary_convo_id = "10" + id;

  const convo = await PendingConvoModel.shared.get(id);
  PendingConvoModel.shared.delete(id);
  ConvoModel.shared.create(uid, id, convo);
  UserModel.shared.addConvo(convo.question, uid, non_primary_convo_id);
  UserModel.shared.addConvo(convo.question, convo.uid, primary_convo_id);
}

export default { start, stop, send, switchPendingStateToThis, get, deleteConvo };
