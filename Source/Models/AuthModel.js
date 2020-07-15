import React, { useRef } from 'react'
import firebase from "firebase";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { Alert } from 'react-native';

class AuthModel {

  checkForAuthentication = (callback) => {
    firebase.auth().onAuthStateChanged(callback)
  }

  stopCheckForAuthentication = () => {
    firebase.auth().onAuthStateChanged(()=>{})
  }

  sendVerification = async (email) => {
    const actionCodeSettings = {
      url: 'https://chaiapp.page.link/verify',
      handleCodeInApp: true,
      iOS: {
        bundleId: 'com.chai'
      },
      android: {
        packageName: 'com.chai'
      }
    }

    return firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings)
  };

  checkIfValidLink = (link) => {
    return firebase.auth().isSignInWithEmailLink(link)
  }

  signIn = async (email, link) => {
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    firebase.auth().signInWithEmailLink(email, link)
  };
}

AuthModel.shared = new AuthModel()
export default AuthModel;
