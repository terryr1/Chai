import AuthModel from './../Models/AuthModel'
import React, { useRef } from 'react'
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import firebase from 'firebase'

class AuthController {

    constructor() {
        this.verificationId = null
        this.recaptchaVerifier = null
    }

    checkForAuthentication = (callback) => {
        console.log("check for authentication")
        AuthModel.shared.checkForAuthentication(callback)
    }

    getCaptcha = () => {
        return (<FirebaseRecaptchaVerifierModal ref={ref => this.recaptchaVerifier = ref} firebaseConfig={firebase.app().options} />)
    }
    
    sendVerification = async (email) => {
        console.log(this.recaptchaVerifier)
        console.log('verifying')
        await AuthModel.shared.sendVerification(() => {}, email)
    }
    
    confirmLink = async (email, link) => {
        if(AuthModel.shared.checkIfValidLink(link)) {
            AuthModel.shared.signIn(email, link);
        }
    }

}


AuthController.shared = new AuthController();
export default AuthController