import firebase from 'firebase';
import 'firebase/firestore';
import Fire from '../Fire';

class PendingConvoModel {
    

    get ref() {
        return Fire.shared.ref.collection('pending conversations')
    }

    parse = (message_array, uid) => {
        
        const mapped_array= message_array.map(message_element => {
            const { timestamp: numberStamp, text } = message_element;

            const timestamp = numberStamp.toDate();

            const message = {
                _id: timestamp.getTime(),
                timestamp,
                text,
                user: {_id: uid, name: "Anonymous"},
            };

            return message;
        })

        const sorted_array = mapped_array.sort((a, b) => {return b._id - a._id})
        return sorted_array;
        
    }

    send = (messages, id) => {
        for (let i = 0; i < messages.length; i++) {
            const { text, user } = messages[i];

            const message = {
                text,
                timestamp: firebase.firestore.Timestamp.now(),
            };

            this.append(message, id);
        }
    }

    append = (message, id) => {
        this.ref.doc(id)
                    .update({
                        messages: firebase.firestore.FieldValue.arrayUnion(message)
                    })
                    .then(data => console.log("request done"))
                    .catch(error => console.log(error))
    }

    on = (callback, id, switchState) => {
        this.ref.doc(id).onSnapshot(snapshot => {
            if(snapshot.exists) {
                callback(this.parse(snapshot.data().messages, snapshot.data().uid))
            } else {
                switchState()
            }
        });
    }

    async off(id) {
        this.ref.doc(id).onSnapshot(() => {});
    }

    listenToNumConvos = (uid, update) => {
        this.ref.onSnapshot(querySnapshot => {
            let numDocs = 0
            querySnapshot.docChanges().forEach((change) => {
                if (change.type === "added" && change.doc.data().uid != uid) {
                    console.log("ADD TO NUM DOCS")
                    numDocs += 1;  
                } else if (change.type === "removed" && change.doc.data().uid != uid) {
                    numDocs -= 1;
                }
            })
            update(numDocs)
        })
    }

    stopListenToNumConvos = () => {
        this.ref.onSnapshot(() => {})
    }

    //pendingConvoListenerOn
    //limit to 20
    //start after whatever timestamp?

    async getConvos(uid, prevDoc) {
        console.log("model getting convos")
        const convos = [];
        let documentSnapshots;

        if(prevDoc) {
            console.log('first call')
            documentSnapshots = await this.ref.startAfter(prevDoc).limit(20).get()
        } else {
            console.log('next call')
            documentSnapshots = await this.ref.limit(20).get()
        }

        prevDoc = null;

        documentSnapshots.forEach(doc => {//do something
            //check if timestamp greater
            if(doc.data().uid != uid) {
                hasDocs = true;
                const convo = {
                    id: doc.id,
                    question: doc.data().question
                }
                convos.push(convo)
            }
            prevDoc = doc
        })
        
        return {convos , prevDoc}
    }

    async get(convo_id) {
        const doc = await this.ref.doc(convo_id).get();
        return doc.data();
    }

    async delete(convo_id) {
        this.ref.doc(convo_id).delete();
    }

    //use push so that it returns the id
    async create(question, uid) {
        const message = {
            text: question,
            timestamp: firebase.firestore.Timestamp.now(),
        };
        
        return this.ref.add({question, messages: [message], timestamp: firebase.firestore.Timestamp.now(), uid})
    }

    //use push so that it returns the id
    async createFromOld({og_id, question, pending_messages}, id) {
        console.log('create from old')
        console.log(og_id)
        console.log(id);
        return this.ref.doc(id).set({question, messages: pending_messages, timestamp: firebase.firestore.Timestamp.now(), uid: og_id})
    }
        
}

PendingConvoModel.shared = new PendingConvoModel();
export default PendingConvoModel;