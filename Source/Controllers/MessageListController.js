import UserModel from "../Models/UserModel";

function start(callback, id) {
  UserModel.shared.on(callback, id);
}

function stop(id) {
  UserModel.shared.off(id);
}

async function removeConvo(uid, id) {
  //to delete 11 only remove from user model
  await UserModel.shared.removeConvo(uid, "1" + id);
}

export default { start, stop, removeConvo };
