import ConvoModel from "../Models/ConvoModel";
import ReportModel from "../Models/ReportModel";
import UserModel from "../Models/UserModel";

async function start(callback, id, alert, pending) {
  if (pending) {
    // console.log("listening for pending messages");
    return ConvoModel.shared.listenForPendingMessages(callback, id);
  } else {
    // console.log("listening for normal messages");
    return ConvoModel.shared.listenForMessages(callback, id, alert);
  }
}

async function send(messages, id, pending) {
  return ConvoModel.shared.send(messages, id, pending);
}

async function getMessages(startTimestamp, convo_id) {
  return ConvoModel.shared.getMessages(startTimestamp, convo_id);
}

async function markRead(convo_id) {
  return UserModel.shared.markRead(convo_id);
}

async function deleteConvo(uid, id) {
  return ConvoModel.shared.delete(id);
}

async function getPendingConvos(uid, prevDoc) {
  const request = await ConvoModel.shared.getConvos(uid, prevDoc);
  return request;
}

async function getNumConvos(uid, update) {
  ConvoModel.shared.getNumConvos(uid, update);
}

async function addUserToConvo(id) {
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

async function getMessageId(convo_id) {
  return ConvoModel.shared.getMessageId(convo_id);
}

export default {
  start,
  send,
  deleteConvo,
  getPendingConvos,
  getNumConvos,
  addUserToConvo,
  resetConvo,
  isPending,
  report,
  getMessages,
  markRead,
  getMessageId,
};
