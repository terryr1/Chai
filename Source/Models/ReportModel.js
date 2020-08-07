import firebase from "firebase";
import "firebase/firestore";
import Fire from "../Fire";
import "firebase/functions";

class ReportModel {
  get ref() {
    return Fire.shared.ref.collection("reports");
  }

  report = async (convo_id) => {
    // console.log("send message call");

    const token = await firebase.auth().currentUser.getIdToken(true);
    const data = { convo_id, token };

    const report = firebase.functions().httpsCallable("report");

    return report(data);
  };

  
}

ReportModel.shared = new ReportModel();
export default ReportModel;
