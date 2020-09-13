import firebase from "firebase";
import "firebase/firestore";
import Fire from "../Fire";
import "firebase/functions";
import { Alert } from "react-native";

class ConvoModel {
  get ref() {
    return Fire.shared.ref.collection("conversations");
  }

  parseHelper = ({ numberStamp, text, uid }) => {
    const timestamp = numberStamp.toDate();

    const message = {
      _id: timestamp.getTime(),
      createdAt: timestamp,
      text,
      user: { _id: uid, name: "Anonymous" },
    };
    return message;
  };

  parseMessages = (changes) => {
    const mapped_array = changes.map(({ doc }) => {
      const { timestamp: numberStamp, text, uid } = doc.data();
      return this.parseHelper({ numberStamp, text, uid });
    });

    const sorted_array = mapped_array.sort((a, b) => {
      return b._id - a._id;
    });
    return sorted_array;
  };

  parsePendingMessages = (message_array, uid) => {
    const mapped_array = message_array.map((message_element) => {
      const { timestamp: numberStamp, text } = message_element;

      return this.parseHelper({ numberStamp, text, uid });
    });

    const sorted_array = mapped_array.sort((a, b) => {
      return b._id - a._id;
    });
    return sorted_array;
  };

  listenForPendingMessages = (callback, convo_id) => {
    // console.log("adding listener for pendinf convo messages");
    return this.ref.doc(convo_id).onSnapshot(
      (snapshot) => {
        // console.log("callback for pending convo message listener called");
        if (snapshot.exists) {
          callback(
            this.parsePendingMessages(snapshot.data().pending_messages, snapshot.data().uid),
            snapshot.data().pending
          );
        }
      },
      (error) => {
        Alert.alert(error);
      }
    );
  };

  listenForMessages = (callback, convo_id, alert) => {
    // console.log("turn on convo message listener");
    return this.ref
      .doc(convo_id)
      .collection("messages")
      .orderBy("timestamp", "asc")
      .limitToLast(20)
      .onSnapshot(
        (querySnapshot) => {
          // console.log("listening to messages");
          if (!querySnapshot.empty) {
            callback(this.parseMessages(querySnapshot.docChanges()));
          }
        },
        () => {
          alert();
        }
      );
  };

  getMessages = async (startTimestamp, convo_id) => {
    const date = new Date(startTimestamp);
    const documentSnapshots = await this.ref
      .doc(convo_id)
      .collection("messages")
      .orderBy("timestamp", "asc")
      .where("timestamp", "<", startTimestamp)
      .limit(20)
      .get();
    return this.parseMessages(documentSnapshots.docChanges());
  };

  send = (messages, convo_id, pending) => {
    for (let i = 0; i < messages.length; i++) {
      const { text } = messages[i];

      if (pending) {
        console.log("sending pending msg");
        this.appendPendingMessage(text, convo_id);
      } else {
        console.log("sending non pending msg");
        this.appendMessage(text, convo_id);
      }
    }
  };

  appendMessage = async (text, convo_id) => {
    // console.log("send message call");

    const token = await firebase.auth().currentUser.getIdToken(true);
    const data = { convo_id, text, token };

    const createMessage = firebase.functions().httpsCallable("createMessage");

    return createMessage(data);
  };

  appendPendingMessage = async (text, convo_id) => {
    // console.log("sending");
    const token = await firebase.auth().currentUser.getIdToken(true);
    const data = { convo_id, text, token };

    const createPendingMessage = firebase.functions().httpsCallable("createPendingMessage");

    createPendingMessage(data).catch((error) => console.log(error));
  };

  addUserToConvo = async (convo_id) => {
    // console.log("adding user to convo");
    const token = await firebase.auth().currentUser.getIdToken(true);
    const addUserToConvo = firebase.functions().httpsCallable("addUserToConvo");
    return addUserToConvo({ convo_id, token });
  };

  removeUserFromConvo = async (convo_id) => {
    const token = await firebase.auth().currentUser.getIdToken(true);
    const removeUserFromConvo = firebase.functions().httpsCallable("removeUserFromConvo");
    return removeUserFromConvo({ convo_id, token });
  };

  create = async (question) => {
    // console.log("create pending convo");

    const token = await firebase.auth().currentUser.getIdToken(true);
    const data = { question, token };

    const createConvo = firebase.functions().httpsCallable("createConvo");
    const result = await createConvo(data);
    return result.data;
  };

  getConvos = async (uid, prevDoc) => {
    // console.log("getting pending convos (first 20)");
    const convos = [];
    let documentSnapshots;

    if (prevDoc) {
      documentSnapshots = await this.ref.startAfter(prevDoc).where("pending", "==", true).limit(20).get();
    } else {
      documentSnapshots = await this.ref.where("pending", "==", true).limit(20).get();
    }

    prevDoc = null;

    documentSnapshots.forEach((doc) => {
      if (doc.data().uid != uid && !doc.data().old_uids.includes(uid)) {
        const convo = {
          id: doc.id,
          question: doc.data().question,
        };
        convos.push(convo);
      }
      prevDoc = doc;
    });

    return { convos, prevDoc };
  };

  delete = async (convo_id) => {
    // console.log("deleting pending convo");
    const token = await firebase.auth().currentUser.getIdToken(true);
    const data = { convo_id, token };

    const deleteConvo = firebase.functions().httpsCallable("deleteConvo");
    return deleteConvo(data);
  };

  isPending = async (convo_id) => {
    const doc = await this.ref.doc(convo_id).get();
    return doc.data().pending;
  };
}

ConvoModel.shared = new ConvoModel();
export default ConvoModel;
