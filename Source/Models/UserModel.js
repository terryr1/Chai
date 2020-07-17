//figure out how to id convos
//create the conversation in pending conversations
import firebase from "firebase";
import "firebase/firestore";
import Fire from "../Fire";

class UserModel {
  get user_ref() {
    return Fire.shared.ref.collection("users");
  }

  async addConvo(question, uid, pending_id) {
    console.log("add convo to user")
    //shouldnt add should be a ref to the pending convo
    //use set to update the array completeley (so get the array change the value from pending to not, and then set that)
    //if the convo id starts with a 1 its pending, if it starts with a 2 its not pending
    this.user_ref
      .doc(uid)
      .set(
        {
          conversations: { [pending_id]: question },
        },
        { merge: true }
      )
      .then((data) => console.log("request done"))
      .catch((error) => console.log("fail"));
  }

  async removeConvo(uid, pending_id) {
    console.log("remove convo from user")
    //shouldnt add should be a ref to the pending convo
    this.user_ref
      .doc(uid)
      .set(
        {
          conversations: { [pending_id]: firebase.firestore.FieldValue.delete() },
        },
        { merge: true }
      )
      .then((data) => console.log("request done"))
      .catch((error) => console.log("fail"));
  }

  createUser = async (uid) => {
    console.log("create new user called")
    const docSnapshot = await this.user_ref.doc(uid).get()
    if (!docSnapshot.exists) {
      this.user_ref
        .doc(uid)
        .set({
          conversations: [],
          rating: 0,
        })
        .then((data) => console.log("request done"))
        .catch((error) => console.log("fail"));
    }
  };

  parse = (conversations) => {
    const ids = Object.keys(conversations);
    return ids.map((id) => {
      const pending = id[0] == 0;
      const primary = pending ? true : id[1] == 0;
      const convo_id = pending ? id.substr(1) : id.substr(2);

      return {
        name: conversations[id],
        convo_id,
        pending,
        primary,
        avatar_url: "",
      };
    });
  };

  on = (callback, uid) => {
    console.log("start user convo listener called")
    this.user_ref.doc(uid).onSnapshot((snapshot) => {
      console.log("user convo listener callback called")
      const data = this.parse(snapshot.data().conversations);
      callback(data);
    });
  };

  off(uid) {
    console.log("stop user convo listener")
    this.user_ref.doc(uid).onSnapshot(() => {});
  }
}

UserModel.shared = new UserModel();
export default UserModel;
