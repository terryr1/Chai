import AuthModel from "./../Models/AuthModel";
import UserModel from "../Models/UserModel";

class AuthController {
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

  addNotificationToken = (token) => {
    UserModel.shared.addNotificationToken(token);
  };
}

AuthController.shared = new AuthController();
export default AuthController;
