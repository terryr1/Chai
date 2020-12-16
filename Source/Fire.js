import firebase from "firebase";
import "firebase/firestore";
import "firebase/functions";
import FirebaseConstants from "./FirebaseConstants";

class Fire {
  constructor() {
    this.init();
  }

  get ref() {
    return firebase.firestore();
  }

  init = () => {
    if (!firebase.apps.length) {
      firebase.initializeApp(FirebaseConstants.config);
    }

    // firebase.firestore().settings({ host: "10.0.2.2:8080", ssl: false });
    // firebase.functions().useFunctionsEmulator("http://10.0.2.2:5001");
    // firebase.auth().useEmulator("http://10.0.2.2:9099/");
  };
}

Fire.shared = new Fire();
export default Fire;
