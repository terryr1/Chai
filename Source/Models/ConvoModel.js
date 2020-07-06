import firebase from 'firebase';
import 'firebase/firestore';
import Fire from '../Fire';

class ConvoModel {

    get ref() {
        return Fire.shared.ref.collection('conversations');
    }

    parse = changes => {
        const mapped_array = changes.map(({doc}) => {
            const { timestamp: numberStamp, text, user } = doc.data();

            const timestamp = numberStamp.toDate();

            const message = {
                _id: timestamp.getTime(),
                timestamp,
                text,
                user,
            };
            return message;
        })

        const sorted_array = mapped_array.sort((a, b) => {return b._id - a._id})
        return sorted_array;
    }

    //say this convo has been deleted here
    send = (messages, id) => {
        console.log("sending message");
        for (let i = 0; i < messages.length; i++) {
            const { text, user } = messages[i];

            const message = {
                text,
                user,
                timestamp: firebase.firestore.Timestamp.now(),
            };

            this.append(message, id);
        }
    }

    append = (message, convo_id) => {
        this.ref.doc(convo_id).collection("messages").add(message)
                    .then(data => console.log("request done"))
                    .catch(error => console.log(error))
    }

    on = (callback, convo_id) => {
        console.log("normal start")
        this.ref.doc(convo_id).collection("messages").onSnapshot(querySnapshot => {
            //if collection deleted popup saying this convo has been resolved/ended
            callback(this.parse(querySnapshot.docChanges()))
        });
    } 

    off(convo_id) {
        this.ref.doc(convo_id).collection("messages").onSnapshot(() => {});
    }

    async get(convo_id) {
        const doc = await this.ref.doc(convo_id).get();
        return doc.data();
    }

    async delete(convo_id) {
        this.ref.doc(convo_id).delete();
    }

    async create(new_uid, id, {question, messages, uid}) {
        this.ref.doc(id).set({question, pending_messages: messages, new_uid, og_id: uid})
        messages.forEach(message => {
            this.ref.doc(id).collection("messages").add({...message, user: {_id: uid, name: "Anonymous"}});
        })
        //update the message to the subcollection messages
    }
        
}

ConvoModel.shared = new ConvoModel();
export default ConvoModel;