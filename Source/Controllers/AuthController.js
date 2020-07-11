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
    
    sendVerification = async (phoneNumber) => {
        console.log(this.recaptchaVerifier)
        console.log('verifying')
        this.verificationId = await AuthModel.shared.sendVerification(this.recaptchaVerifier, phoneNumber)
    }
    
    confirmCode = async (code) => {
        if(this.verificationId) {
            const result = await AuthModel.shared.confirmCode(this.verificationId, code)
            return result
        } else {
            error("invalid id")
        }
    }

}


AuthController.shared = new AuthController();
export default AuthController