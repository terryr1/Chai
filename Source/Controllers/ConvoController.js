import ConvoModel from "../Models/ConvoModel";
import ReportModel from "../Models/ReportModel";

async function start(callback, id, alert, pending) {
  //start both listeners
  if (pending) {
    console.log('listening for pending messages')
    return ConvoModel.shared.listenForPendingMessages(callback, id);
  } else {
    console.log('listening for normal messages')
    return ConvoModel.shared.listenForMessages(callback, id, alert);
  }
}

async function send(messages, id, pending) {
  return ConvoModel.shared.send(messages, id, pending);
}

async function deleteConvo(uid, id) {
  //to delete 11 only remove from user model
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
  return ConvoModel.shared.addUserToConvo(id);
}

async function resetConvo(id) {
  return ConvoModel.shared.removeUserFromConvo(id);
}

async function isPending(id) {
  return ConvoModel.shared.isPending(id);
}

async function report(id) {
  return ReportModel.shared.report(id);
}

export default { start, send, deleteConvo, getPendingConvos, getNumConvos, addUserToConvo, resetConvo, isPending, report };
