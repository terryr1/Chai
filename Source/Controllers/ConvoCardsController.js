import PendingConvoModel from "../Models/PendingConvoModel"

//gets 20 pending convos as a batch, then next 20, so on
async function getPendingConvos(uid, prevDoc) {
    //append 0 to id
    const request = await PendingConvoModel.shared.getConvos(uid, prevDoc);
    return request;
}

function listen(uid, update) {
    PendingConvoModel.shared.listenToNumConvos(uid, update);
}

function stopListen() {
    PendingConvoModel.shared.stopListenToNumConvos();
}

export default {getPendingConvos, listen, stopListen}