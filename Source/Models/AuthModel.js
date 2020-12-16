import firebase from "firebase";
import { Alert } from "react-native";
import FirebaseConstants from "./../FirebaseConstants";

class AuthModel {
  checkForAuthentication = (callback) => {
    // console.log("start check for authentication");
    firebase.auth().onAuthStateChanged(
      (user) => {
        // console.log("check for authentication listener called");
        callback(user);
      },
      (error) => {
        Alert.alert("Uh oh", error.toString());
      }
    );
  };

  stopCheckForAuthentication = () => {
    // console.log("stop check for authentiocation");
    firebase.auth().onAuthStateChanged(() => {});
  };

  sendVerification = async (email) => {
    // console.log("sending verification");
    const actionCodeSettings = {
      url: FirebaseConstants.verificationUrl,
      dynamicLinkDomain: FirebaseConstants.verificationDomain,
      handleCodeInApp: true,
      iOS: {
        bundleId: "com.chaitheapp",
      },
      android: {
        packageName: "com.chaitheapp",
      },
    };

    return firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings);
  };

  checkIfValidLink = (link) => {
    console.log("check if valid link called");
    return firebase.auth().isSignInWithEmailLink(link);
  };

  getUser = async () => {
    // console.log("get user called");
    return firebase.auth().currentUser;
  };

  signIn = async (email, link) => {
    console.log("signing in with email link");
    firebase
      .auth()
      .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .catch(function (err) {
        Alert.alert("Uh oh", err.toString());
      });
    firebase
      .auth()
      .signInWithEmailLink(email, link)
      .catch(function (err) {
        Alert.alert("Uh oh", err.toString());
      });
  };

  signOut = async () => {
    firebase
      .auth()
      .signOut()
      .catch(function (err) {
        Alert.alert("Uh oh", err.toString());
      });
  };
}

AuthModel.shared = new AuthModel();
export default AuthModel;
