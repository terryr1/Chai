import React from "react";
import {
  View,
  TextInput,
  StatusBar,
  Linking,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-navigation";
import AuthController from "../Controllers/AuthController";
import { Notifications } from "expo";
import * as Permissions from "expo-permissions";
import AsyncStorage from "@react-native-community/async-storage";
import Constants from "../Constants";

class Setup extends React.Component {
  constructor(props) {
    super();
    this.enteredEmail = "";
    this.state = {
      email: "",
      user: null,
      url: "",
      currentStep: this.stepOne,
    };
  }

  registerForPushNotifications = async () => {
    const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    let finalStatus = status;

    if (status !== "granted") {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return;
    }

    let token = await Notifications.getExpoPushTokenAsync();
    console.log("adding token?");
    AuthController.shared.addNotificationToken(token);
    AsyncStorage.setItem("notification_permission", "granted");
  };

  componentDidUpdate = async () => {
    if (this.state.user) {
      this.props.navigation.replace("Main", { uid: this.state.user.uid });
    }
  };

  componentDidMount = () => {
    AsyncStorage.clear();
    this._unsubscribeFocus = this.props.navigation.addListener("focus", () => {
      AuthController.shared.checkForAuthentication((user) => {
        if (user) {
          this.setState({ user: user }, this.registerForPushNotifications);
        }
      });
      Linking.addEventListener("url", (event) => {
        AuthController.shared.confirmLink(this.enteredEmail, event.url);
      });
    });

    this._unsubscribeBlur = this.props.navigation.addListener("blur", () => {
      AuthController.shared.stopCheckForAuthentication();
    });
  };

  componentWillUnmount = () => {
    this._unsubscribeFocus();
    this._unsubscribeBlur();
  };

  onChangeEmail = (val) => {
    this.setState({ email: val });
  };

  onChangeUrl = (val) => {
    this.setState({ url: val });
  };

  verifyEmail = async () => {
    Alert.alert(
      "Note",
      `For the sake of anonymity, we STRONGLY reccommend AGAINST using an email with your name in it. Developers can connect your email to your conversations, we may look at these for development reasons. Are you sure you want to continue with '${this.state.email}'?`,

      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "OK",
          onPress: () => this.setState({ currentStep: this.stepOneHalf }),
        },
      ]
    );
  };

  sendVerification = async () => {
    this.enteredEmail = this.state.email;
    AuthController.shared
      .sendVerification(this.enteredEmail)
      .then(() => this.setState({ currentStep: this.stepTwo }))
      .catch((err) => Alert.alert("Uh oh", err.message));
  };

  stepThree = () => {
    return (
      <>
        <Text style={style.mainText}>Copy the link sent to your email and enter it here:</Text>
        <View style={style.inputView}>
          <TextInput
            style={{ ...style.inputText }}
            onChangeText={this.onChangeUrl}
            value={this.state.url}
            placeholder="Paste link here..."
            placeholderTextColor="white"
          />
        </View>
        <TouchableOpacity
          style={{ ...style.button, marginBottom: 10 }}
          onPress={() => AuthController.shared.confirmLink(this.enteredEmail, this.state.url)}
        >
          <Text style={style.buttonText}>VERIFY</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ ...style.button }}
          onPress={() => this.setState({ currentStep: this.stepTwo, url: "" })}
        >
          <Text style={style.buttonText}>GO BACK</Text>
        </TouchableOpacity>
      </>
    );
  };

  stepTwo = () => {
    return (
      <>
        <Text style={style.mainText}>
          Click the link we sent to your email to continue. Check your spam if you don't see the email after a few
          minutes.
        </Text>
        <TouchableOpacity
          style={{ ...style.button, marginBottom: 10 }}
          onPress={() => this.setState({ currentStep: this.stepThree })}
        >
          <Text style={style.buttonText}>ENTER LINK MANUALLY</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ ...style.button }} onPress={() => this.setState({ currentStep: this.stepOne })}>
          <Text style={style.buttonText}>GO BACK</Text>
        </TouchableOpacity>
      </>
    );
  };

  stepOneHalf = () => {
    return (
      <>
        <Text style={{ ...style.mainText, paddingVertical: 0, fontSize: 20 }}>
          By pressing accept, you accept the terms and conditions and privacy policy found in the links below:
        </Text>
        <TouchableOpacity
          style={{
            ...style.button,
            marginBottom: 10,
            alignItems: "flex-start",
          }}
          onPress={() => Linking.openURL("https://www.chaitheapp.com/terms-and-conditions")}
        >
          <Text style={{ ...style.buttonText, color: "white" }}>Terms and Conditions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            ...style.button,
            marginBottom: 10,
            margin: 10,
            alignItems: "flex-start",
          }}
          onPress={() => Linking.openURL("https://www.chaitheapp.com/privacy-policy")}
        >
          <Text style={{ ...style.buttonText, color: "white" }}>Privacy Policy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ ...style.button, marginBottom: 10, margin: 0 }} onPress={this.sendVerification}>
          <Text style={style.buttonText}>ACCEPT</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ ...style.button, marginBottom: 10, margin: 0 }}
          onPress={() => this.setState({ currentStep: this.stepOne })}
        >
          <Text style={style.buttonText}>GO BACK</Text>
        </TouchableOpacity>
      </>
    );
  };

  stepOne = () => {
    return (
      <>
        <Text style={style.mainText}>Welcome to Chai, enter your email to login or sign up:</Text>
        <View style={style.inputView}>
          <TextInput
            keyboardType="email-address"
            style={style.inputText}
            onChangeText={this.onChangeEmail}
            value={this.state.email}
            placeholder="Type email here..."
            placeholderTextColor="white"
          />
        </View>
        <TouchableOpacity style={style.button} onPress={this.verifyEmail}>
          <Text style={style.buttonText}>CONTINUE</Text>
        </TouchableOpacity>
      </>
    );
  };

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView style={style.container}>
          <StatusBar backgroundColor={Constants.backgroundColor} barStyle="light-content" />
          {this.state.currentStep()}
        </SafeAreaView>
      </TouchableWithoutFeedback>
    );
  }
}

export default Setup;

const style = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Constants.backgroundColor,
  },
  mainText: {
    paddingVertical: 25,
    paddingHorizontal: 5,
    width: "80%",
    color: Constants.mainTextColor,
    fontSize: 23,
  },
  inputView: {
    paddingVertical: 25,
    paddingHorizontal: 5,
    width: "80%",
    height: 35,
    justifyContent: "center",
  },
  inputText: {
    height: 50,
    fontSize: 18,
    color: Constants.mainTextColor,
  },
  buttonText: {
    color: Constants.accentColorOne,
    lineHeight: 50,
    fontSize: 18,
  },
  button: {
    marginTop: 30,
    paddingHorizontal: 5,
    marginBottom: 150,
    width: "80%",
    height: 35,
    alignItems: "flex-end",
    justifyContent: "center",
  },
});
