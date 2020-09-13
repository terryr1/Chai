import UserModel from "../Models/UserModel";

async function start(callback, id) {
  return UserModel.shared.on(callback, id);
}

function removeConvo(id) {
  return UserModel.shared.removeConvo(id);
}


export default { start, removeConvo };
