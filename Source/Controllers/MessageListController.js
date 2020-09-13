import UserModel from "../Models/UserModel";

function start(callback, id) {
  UserModel.shared.on(callback, id);
}

function stop(id) {
  UserModel.shared.off(id);
}

function removeConvo(id) {
  return UserModel.shared.removeConvo(id);
}


export default { start, stop, removeConvo };
