import React, { useRef } from 'react'
import firebase from "firebase";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";

class AuthModel {

  checkForAuthentication = (callback) => {
    firebase.auth().onAuthStateChanged(callback)
  }

  sendVerification = async (recaptchaVerifier, phoneNumber) => {
    const phoneProvider = new firebase.auth.PhoneAuthProvider();
    const verificationId = await phoneProvider.verifyPhoneNumber(phoneNumber, recaptchaVerifier);
    return verificationId
  };

  confirmCode = async (verificationId, code) => {
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, code);
    const result = await firebase
      .auth()
      .signInWithCredential(credential)
    console.log(result)
    return result
  };
}

AuthModel.shared = new AuthModel()
export default AuthModel;
