import React, { useRef } from 'react'
import firebase from "firebase";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { Linking } from 'expo';
import { Alert } from 'react-native';

class AuthModel {

  checkForAuthentication = (callback) => {
    firebase.auth().onAuthStateChanged(callback)
  }

  sendVerification = async (callback, email) => {
    const actionCodeSettings = {
      url: 'https://chaitheapp.page.link/verify',
      handleCodeInApp: true,
      iOS: {
        bundleId: 'com.chai'
      },
      android: {
        packageName: 'com.chai'
      }
    }
    console.log(actionCodeSettings.url)
    console.log(email)
    Linking.addEventListener('verify', callback)
    firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings)
    // const phoneProvider = new firebase.auth.PhoneAuthProvider();
    // const verificationId = await phoneProvider.verifyPhoneNumber(phoneNumber, recaptchaVerifier);
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
