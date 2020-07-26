//figure out how to id convos
//create the conversation in pending conversations
import firebase from "firebase";
import "firebase/firestore";
import Fire from "../Fire";

class UserModel {
  get user_ref() {
    return Fire.shared.ref.collection("users");
  }

  parse = (conversations) => {
    const ids = Object.keys(conversations);
    return ids.map((id) => {
      const primary = id[0] == 0;
      const convo_id = id.substr(1);

      return {
        name: conversations[id],
        convo_id,
        primary,
        avatar_url: "",
      };
    });
  };

  on = (callback, uid) => {
    console.log("start user convo listener called");
    this.user_ref.doc(uid).onSnapshot((snapshot) => {
      console.log("user convo listener callback called");
      const data = this.parse(snapshot.data().conversations);
      callback(data);
    });
  };

  off(uid) {
    console.log("stop user convo listener");
    this.user_ref.doc(uid).onSnapshot(() => {});
  }

  async removeConvo(convo_id) {
    const token = await firebase.auth().currentUser.getIdToken(true);
    const data = { convo_id, token };

    const removeConvo = firebase.functions().httpsCallable("removeConvo");

    return removeConvo(data);
  }
}

UserModel.shared = new UserModel();
export default UserModel;
