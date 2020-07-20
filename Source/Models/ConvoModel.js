import firebase from "firebase";
import "firebase/firestore";
import Fire from "../Fire";

class ConvoModel {
  get ref() {
    return Fire.shared.ref.collection("conversations");
  }

  parseMessages = (changes) => {
    const mapped_array = changes.map(({ doc }) => {
      const { timestamp: numberStamp, text, user } = doc.data();

      const timestamp = numberStamp.toDate();

      const message = {
        _id: timestamp.getTime(),
        timestamp,
        text,
        user,
      };
      return message;
    });

    const sorted_array = mapped_array.sort((a, b) => {
      return b._id - a._id;
    });
    return sorted_array;
  };

  //can probablu be abstracted with pending messages
  parsePendingMessages = (message_array, uid) => {
    const mapped_array = message_array.map((message_element) => {
      const { timestamp: numberStamp, text } = message_element;

      const timestamp = numberStamp.toDate();

      const message = {
        _id: timestamp.getTime(),
        timestamp,
        text,
        user: { _id: uid, name: "Anonymous" },
      };

      return message;
    });

    const sorted_array = mapped_array.sort((a, b) => {
      return b._id - a._id;
    });
    return sorted_array;
  };

  listenForPendingMessages = (callback, id) => {
    console.log("adding listener for pendinf convo messages");
    this.ref.doc(id).onSnapshot((snapshot) => {
      console.log("callback for pending convo message listener called");
      if (snapshot.exists) {
        callback(this.parsePendingMessages(snapshot.data().pending_messages, snapshot.data().uid), snapshot.data().pending);
      }
    });
  };

  async stopListenForPendingMessages(id) {
    console.log("stop pending convo message listner");
    return this.ref.doc(id).onSnapshot(() => {});
  }

  listenForMessages = (callback, convo_id, alert) => {
    console.log("turn on convo message listener");
    console.log(convo_id)
    this.ref
      .doc(convo_id)
      .collection("messages")
      .onSnapshot((querySnapshot) => {
        console.log("getting normal convo messages callback");
        //if collection deleted popup saying this convo has been resolved/ended
        if (!querySnapshot.empty) {
          console.log("NOT EMPTY")
          callback(this.parseMessages(querySnapshot.docChanges()));
        } else {
          console.log("EMPTY")
          //alert();
        }
      });
  };

  async stopListenForMessages(convo_id) {
    console.log("turn off convo message listener");
    return this.ref
      .doc(convo_id)
      .collection("messages")
      .onSnapshot(() => {});
  }

  send = (messages, id, pending) => {
    for (let i = 0; i < messages.length; i++) {
      const { text, user } = messages[i];

      const message = {
        text,
        user,
        timestamp: firebase.firestore.Timestamp.now(),
      };

      if (pending) {
        this.appendPendingMessage(message, id);
      } else {
        this.appendMessage(message, id);
      }
    }
  };

  appendMessage = (message, id) => {
    console.log("send message call");
    this.ref
      .doc(id)
      .collection("messages")
      .add(message)
      .then((data) => console.log("request done"))
      .catch((error) => console.log(error));
  };

  appendPendingMessage = (message, id) => {
    console.log("sending pending convo message");
    this.ref
      .doc(id)
      .update({
        pending_messages: firebase.firestore.FieldValue.arrayUnion(message),
      })
      .then((data) => console.log("request done"))
      .catch((error) => console.log(error));
  };

  getNumConvos = (uid, update) => {
    //get count of documents by using another document that gets updated in a cloud function based on when documents get created or are updated to pending or deleted/moved to pending
    //then get the number of documents available from there so we always know the correct count
  };

  //add an index on pending
  async getConvos(uid, prevDoc) {
    console.log("getting pending convos (first 20)");
    const convos = [];
    let documentSnapshots;

    if (prevDoc) {
      documentSnapshots = await this.ref.startAfter(prevDoc).where("pending", "==", true).limit(100).get();
    } else {
      documentSnapshots = await this.ref.where("pending", "==", true).limit(100).get();
    }

    prevDoc = null;

    documentSnapshots.forEach((doc) => {
      //do something
      //check if timestamp greater
      if (doc.data().uid != uid) {
        const convo = {
          id: doc.id,
          question: doc.data().question,
        };
        convos.push(convo);
      }
      prevDoc = doc;
    });

    return { convos, prevDoc };
  }

  async addUserToConvo(new_uid, id) {
    console.log("creating convo");

    this.ref.doc(id).set({ pending: false, new_uid }, { merge: true });
    const doc = await this.ref.doc(id).get();
    const promises = []
    doc.data().pending_messages.forEach((message) => {
      promises.push(this.ref.doc(id).collection("messages").add(message));
    });
    return Promise.all(promises)
  }

  async removeUserFromConvo(id) {
    console.log("set convo back ti paneing");

    return this.ref.doc(id).set({ pending: true, new_uid: null }, { merge: true });
  }

  //use push so that it returns the id
  async create(question, uid) {
    console.log("create pending convo");
    const message = {
      text: question,
      timestamp: firebase.firestore.Timestamp.now(),
      user: { _id: uid, name: "Anonymous" },
    };

    const id = this.ref.add({
      question,
      pending_messages: [message],
      timestamp: firebase.firestore.Timestamp.now(),
      uid,
      pending: true,
    });
    return id;
  }

  async delete(convo_id) {
    console.log("deleting pending convo");
    return this.ref.doc(convo_id).delete();
  }

  async isPending(convo_id) {
    const doc = await this.ref.doc(convo_id).get()
    return doc.data().pending
  }
}

ConvoModel.shared = new ConvoModel();
export default ConvoModel;
