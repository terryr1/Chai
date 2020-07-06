import ConvoModel from "../Models/ConvoModel"
import PendingConvoModel from "../Models/PendingConvoModel"
import UserModel from "../Models/UserModel";
import { RefreshControlBase } from "react-native";

async function start(callback, id, switchState) {
    //append 0 to id
    console.log("start not pending")
    ConvoModel.shared.on(callback, id, switchState);
}

async function send(messages, id) {   
    //append 0 to id
    return ConvoModel.shared.send(messages, id)
}

async function stop(id) {
    //append 0 to id
    await ConvoModel.shared.off(id);
}

async function get(id) {
    console.log(id);
    const convo = await ConvoModel.shared.get(id);
    console.log(convo);
    return convo;
}

async function deleteConvo(uid, id) {
    const convo_id = '1' + id;
    await UserModel.shared.removeConvo(uid, convo_id);
    await ConvoModel.shared.delete(id);
    console.log("DONE DELETE")
}

async function switchPendingState(uid, id) {

    const pending_convo_id = '0' + id;
    const convo_id = '1' + id;

    const convo = await PendingConvoModel.shared.get(id);
    UserModel.shared.removeConvo(convo.uid, pending_convo_id);
    PendingConvoModel.shared.delete(id);
    ConvoModel.shared.create(uid, id, convo);
    UserModel.shared.addConvo(convo.question, uid, convo_id);
    UserModel.shared.addConvo(convo.question, convo.uid, convo_id);
}

export default {start, stop, send, switchPendingState, get, deleteConvo}