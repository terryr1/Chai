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
      return {
        name: conversations[id].question,
        convo_id: id,
        primary: conversations[id].primary,
        unread: conversations[id].unread,
      };
    });
  };

  addNotificationToken = async (notificationToken) => {
    const token = await firebase.auth().currentUser.getIdToken(true);
    const data = { notificationToken, token };

    const addNotificationToken = firebase.functions().httpsCallable("addNotificationToken");

    return addNotificationToken(data);
  };

  clearNotificationToken = async () => {
    const token = await firebase.auth().currentUser.getIdToken(true);
    const data = { token };

    const clearNotificationToken = firebase.functions().httpsCallable("clearNotificationToken");

    return clearNotificationToken(data);
  };

  on = (callback, uid) => {
    // console.log("start user convo listener called");
    return this.user_ref.doc(uid).onSnapshot(
      (snapshot) => {
        // console.log("user convo listener callback called");
        const data = this.parse(snapshot.data().conversations);
        callback(data);
      },
      () => {
        //err
      }
    );
  };

  removeConvo = async (convo_id) => {
    const token = await firebase.auth().currentUser.getIdToken(true);
    const data = { convo_id, token };

    const removeConvo = firebase.functions().httpsCallable("removeConvo");

    return removeConvo(data);
  };

  markRead = async (convo_id) => {
    const token = await firebase.auth().currentUser.getIdToken(true);
    const data = { convo_id, token };

    const markRead = firebase.functions().httpsCallable("markRead");
    return markRead(data);
  };
}

UserModel.shared = new UserModel();
export default UserModel;
