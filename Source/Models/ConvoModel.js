import firebase from "firebase";
import "firebase/firestore";
import Fire from "../Fire";
import "firebase/functions";
import { Alert } from "react-native";
import Constants from "../Constants";

class ConvoModel {
  get ref() {
    return Fire.shared.ref.collection("conversations");
  }

  parseHelper = ({ numberStamp, text, uid, _id }) => {
    const timestamp = numberStamp.toDate();

    const message = {
      _id,
      createdAt: timestamp,
      text,
      user: { _id: uid, name: "Anonymous" },
    };
    return message;
  };

  parseMessages = (changes) => {
    const mapped_array = changes.map(({ doc }) => {
      const { timestamp: numberStamp, text, uid } = doc.data();
      return this.parseHelper({ numberStamp, text, uid, _id: doc.id });
    });
    return mapped_array;
  };

  parsePendingMessages = (message_array, uid) => {
    const mapped_array = message_array.map((message_element) => {
      const { timestamp: numberStamp, text, _id } = message_element;
      return this.parseHelper({ numberStamp, text, uid, _id });
    });
    return mapped_array;
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
      (err) => {
        console.log(err.toString());
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
        (err) => {
          console.log(err.toString());
        }
      );
  };

  getMessages = async (startTimestamp, convo_id) => {
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
    messages.forEach((message) => {
      if (pending) {
        // console.log("sending pending msg");
        this.appendPendingMessage(message.text, convo_id, message._id);
      } else {
        // console.log("sending non pending msg");
        this.appendMessage(message.text, convo_id, message._id);
      }
    });
  };

  appendMessage = async (text, convo_id, message_id) => {
    // console.log("send message call");

    const token = await firebase.auth().currentUser.getIdToken(true);
    const data = { convo_id, text, token, message_id };

    const createMessage = firebase.functions().httpsCallable("createMessage");

    return createMessage(data).catch((error) => console.log(error));
  };

  appendPendingMessage = async (text, convo_id, message_id) => {
    // console.log("sending");
    const token = await firebase.auth().currentUser.getIdToken(true);
    const data = { convo_id, text, token, message_id };

    const createPendingMessage = firebase.functions().httpsCallable("createPendingMessage");

    createPendingMessage(data).catch((error) => console.log(error));
  };

  addUserToConvo = async (convo_id, firstMessage) => {
    // console.log("adding user to convo");
    const token = await firebase.auth().currentUser.getIdToken(true);
    const addUserToConvo = firebase.functions().httpsCallable("addUserToConvo");
    return addUserToConvo({ convo_id, token, firstMessage }).catch((error) => console.log(error));
  };

  removeUserFromConvo = async (convo_id) => {
    const token = await firebase.auth().currentUser.getIdToken(true);
    const removeUserFromConvo = firebase.functions().httpsCallable("removeUserFromConvo");
    return removeUserFromConvo({ convo_id, token }).catch((error) => console.log(error));
  };

  create = async (question, category) => {
    console.log("create pending convo");

    const token = await firebase.auth().currentUser.getIdToken(true);
    const data = { question, category, token };
    console.log(data);

    const createConvo = firebase.functions().httpsCallable("createConvo");

    return createConvo(data);
  };

  getConvos = async (uid, prevDoc, filters) => {
    console.log("getting pending convos (first 20)");
    const convos = [];
    let documentSnapshots;

    let addFiltersToQuery = this.ref;
    if (filters.languages && filters.categories.length > 0) {
      addFiltersToQuery = this.ref
        .where("category", "in", filters.categories)
        .where("language", "==", filters.languages);
    } else if (filters.languages) {
      addFiltersToQuery = this.ref.where("language", "==", filters.languages);
    } else if (filters.categories.length > 0) {
      addFiltersToQuery = this.ref.where("category", "in", filters.categories);
    }

    if (prevDoc) {
      documentSnapshots = await addFiltersToQuery.startAfter(prevDoc).where("pending", "==", true).limit(20).get();
    } else {
      documentSnapshots = await addFiltersToQuery.where("pending", "==", true).limit(20).get();
    }

    prevDoc = null;

    documentSnapshots.forEach((doc) => {
      if (doc.data().uid != uid && !doc.data().old_uids.includes(uid)) {
        const convo = {
          id: doc.id,
          question: doc.data().question,
          category: doc.data().category,
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
    return deleteConvo(data).catch((error) => console.log(error));
  };

  isPending = async (convo_id) => {
    const doc = await this.ref.doc(convo_id).get();
    return doc.data().pending;
  };

  getMessageId = async (convo_id) => {
    return this.ref.doc(convo_id).collection("messages").doc().id;
  };
}

ConvoModel.shared = new ConvoModel();
export default ConvoModel;
