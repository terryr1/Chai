import UserModel from "../Models/UserModel"
import PendingConvoModel from "../Models/PendingConvoModel";

async function create(question, uid) {
    //use push to create a unique id
    const pending_convo = await PendingConvoModel.shared.create(question, uid);
    //append 1 to it before adding to model
    let pending_id = '0' + pending_convo.id
    UserModel.shared.addConvo(question, uid, pending_id);
    return pending_convo.id;
}

export default {create}