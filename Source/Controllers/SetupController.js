import UserModel from "../Models/UserModel"

function createUser(uid) {
    UserModel.shared.createUser(uid);
}

export default {createUser}