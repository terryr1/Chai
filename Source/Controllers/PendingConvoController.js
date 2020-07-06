import ConvoModel from "../Models/ConvoModel"
import PendingConvoModel from "../Models/PendingConvoModel"
import UserModel from '../Models/UserModel'

async function start(callback, id, switchState) {
    //append 0 to id
    PendingConvoModel.shared.on(callback, id, switchState);
}

async function send(messages, id) {
    //append 0 to id
    return PendingConvoModel.shared.send(messages, id)
}

async function stop(id) {
    //append 0 to id
    console.log("stopping pending")
    await PendingConvoModel.shared.off(id);
}

async function switchPendingState(uid, id) {

    console.log("switching")
    const pending_convo_id = '0' + id;
    const convo_id = '1' + id;

    const convo = await ConvoModel.shared.get(id);
    console.log(convo);
    console.log(id);
    UserModel.shared.removeConvo(convo.og_id, convo_id);
    ConvoModel.shared.delete(id);
    PendingConvoModel.shared.createFromOld(convo, id);
    UserModel.shared.addConvo(convo.question, convo.og_id, pending_convo_id);
}

export default {start, stop, send, switchPendingState}