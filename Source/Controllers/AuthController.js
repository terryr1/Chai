import AuthModel from "./../Models/AuthModel";
import UserModel from "../Models/UserModel";
import { Alert } from "react-native";

class AuthController {
  checkForAuthentication = (callback) => {
    AuthModel.shared.checkForAuthentication(callback);
  };

  stopCheckForAuthentication = () => {
    AuthModel.shared.stopCheckForAuthentication();
  };

  sendVerification = async (email) => {
    console.log("in controller");
    return AuthModel.shared.sendVerification(email);
  };

  getUser = async () => {
    return AuthModel.shared.getUser();
  };

  deleteUser = async () => {
    Alert.alert("does nothing");
  };

  confirmLink = async (email, link) => {
    if (AuthModel.shared.checkIfValidLink(link)) {
      AuthModel.shared.signIn(email, link);
    }
  };

  addNotificationToken = (token) => {
    UserModel.shared.addNotificationToken(token);
  };

  signOut = () => {
    AuthModel.shared.signOut();
  };
}

AuthController.shared = new AuthController();
export default AuthController;
