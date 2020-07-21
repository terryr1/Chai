//figure out how to id convos
//create the conversation in pending conversations
import firebase from "firebase";
import "firebase/firestore";
import Fire from "../Fire";

class UserModel {
  get user_ref() {
    return Fire.shared.ref.collection("users");
  }

  async addConvo(question, uid, convo_id) {
    console.log("add convo to user");
    
    this.user_ref
      .doc(uid)
      .set(
        {
          conversations: { [convo_id]: question },
        },
        { merge: true }
      )
      .then((data) => console.log("request done"))
      .catch((error) => console.log("fail"));
  }

  async removeConvo(uid, convo_id) {
    console.log("remove convo from user");
    //shouldnt add should be a ref to the pending convo
    this.user_ref
      .doc(uid)
      .set(
        {
          conversations: { [convo_id]: firebase.firestore.FieldValue.delete() },
        },
        { merge: true }
      )
      .then((data) => console.log("request done"))
      .catch((error) => console.log("fail"));
  }

  createUser = async (uid) => {
    console.log("create new user called");
    const docSnapshot = await this.user_ref.doc(uid).get();
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
}

UserModel.shared = new UserModel();
export default UserModel;
