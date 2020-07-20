import ConvoModel from "../Models/ConvoModel";
import UserModel from "../Models/UserModel";

async function start(callback, id, alert, pending) {
  //start both listeners
  if (pending) {
    console.log("starting pending")
    ConvoModel.shared.listenForPendingMessages(callback, id);
  } else {
    console.log("START NOT PENDING")
    ConvoModel.shared.listenForMessages(callback, id, alert);
  }
}

async function send(messages, id, pending) {
  return ConvoModel.shared.send(messages, id, pending);
}

async function stop(id) {
  await ConvoModel.shared.stopListenForMessages(id);
  return ConvoModel.shared.stopListenForPendingMessages(id);
}

async function deleteConvo(uid, id) {
  //to delete 11 only remove from user model
  await UserModel.shared.removeConvo(uid, "0" + id);
  return ConvoModel.shared.delete(id);
}

async function getPendingConvos(uid, prevDoc) {
  const request = await ConvoModel.shared.getConvos(uid, prevDoc);
  return request;
}

async function getNumConvos(uid, update) {
  ConvoModel.shared.getNumConvos(uid, update);
}

async function addUserToConvo(question, uid, id) {
  const promises= []
  promises.push(ConvoModel.shared.addUserToConvo(uid, id));
  promises.push(UserModel.shared.addConvo(question, uid, "1" + id));
  return Promise.all(promises)
}

async function resetConvo(id) {
  return ConvoModel.shared.removeUserFromConvo(id);
}

async function isPending(id) {
  return ConvoModel.shared.isPending(id);
}

export default { start, stop, send, deleteConvo, getPendingConvos, getNumConvos, addUserToConvo, resetConvo, isPending };
