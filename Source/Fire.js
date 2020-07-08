import firebase from "firebase";
import "firebase/firestore";

class Fire {
  constructor() {
    console.log("initializing");
    this.init();
    this.observeAuth();
  }

  observeAuth = () => firebase.auth().onAuthStateChanged(this.onAuthStateChanged);

  onAuthStateChanged = (user) => {
    if (!user) {
      try {
        firebase.auth().signInAnonymously();
      } catch ({ message }) {
        alert(message);
      }
    }
  };

  get ref() {
    return firebase.firestore();
  }

  get uid() {
    return (firebase.auth().currentUser || {}).uid;
  }


  init = () => {
    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: "AIzaSyCXuiM5nxFnSkXaTuLHSylTJjfz6AqSEYA",
        authDomain: "chai-87874.firebaseapp.com",
        databaseURL: "https://chai-87874.firebaseio.com",
        projectId: "chai-87874",
        storageBucket: "chai-87874.appspot.com",
        messagingSenderId: "846830191629",
        appId: "1:846830191629:web:9b4d5ae19db360e30c0144",
        measurementId: "G-K253SKL3P4",
      });
    }
  };
}

Fire.shared = new Fire();
export default Fire;
