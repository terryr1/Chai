import AuthModel from "./../Models/AuthModel";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import firebase from "firebase";
import UserModel from "../Models/UserModel";

class AuthController {
  async createUser(uid) {
    await UserModel.shared.createUser(uid);
  }

  checkForAuthentication = (callback) => {
    AuthModel.shared.checkForAuthentication(callback);
  };

  stopCheckForAuthentication = () => {
    AuthModel.shared.stopCheckForAuthentication();
  };

  sendVerification = async (email) => {
    return AuthModel.shared.sendVerification(email);
  };

  getUser = async () => {
    return AuthModel.shared.getUser();
  };

  confirmLink = async (email, link) => {
    if (AuthModel.shared.checkIfValidLink(link)) {
      AuthModel.shared.signIn(email, link);
    }
  };
}

AuthController.shared = new AuthController();
export default AuthController;
