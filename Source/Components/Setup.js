import React from "react";
import { View, TextInput, StatusBar, Linking, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
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
    AuthController.shared.addNotificationToken(token);
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

  sendVerification = async () => {
    Alert.alert(
      "Note",
      `We STRONGLY recommend against using an email with your name in it. Developers (just me right now) can connect your email to your conversations, we may look at these for development reasons. Are you sure you want to continue with '${this.state.email}'?`,

      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "OK",
          onPress: () => {
            this.enteredEmail = this.state.email;
            AuthController.shared
              .sendVerification(this.enteredEmail)
              .then(() => this.setState({ currentStep: this.stepTwo }))
              .catch((err) => Alert.alert(err.message));
          },
        },
      ]
    );
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
            placeholder="Link"
          />
        </View>
        <TouchableOpacity
          style={{ ...style.button, marginBottom: 40 }}
          onPress={() => AuthController.shared.confirmLink(this.enteredEmail, this.state.url)}
        >
          <Text style={style.buttonText}>VERIFY</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ ...style.button, backgroundColor: "#454545" }}
          onPress={() => this.setState({ currentStep: this.stepTwo })}
        >
          <Text style={style.buttonText}>GO BACK</Text>
        </TouchableOpacity>
      </>
    );
  };

  stepTwo = () => {
    return (
      <>
        <Text style={style.mainText}>Click the link we sent to your email to continue</Text>
        <TouchableOpacity
          style={{ ...style.button, marginBottom: 40 }}
          onPress={() => this.setState({ currentStep: this.stepThree })}
        >
          <Text style={style.buttonText}>ENTER LINK MANUALLY</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ ...style.button, backgroundColor: "#454545" }}
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
        <Text style={style.mainText}>Enter your email to login or sign up:</Text>
        <View style={style.inputView}>
          <TextInput
            keyboardType="email-address"
            style={style.inputText}
            onChangeText={this.onChangeEmail}
            value={this.state.email}
            placeholder="Email"
          />
        </View>
        <TouchableOpacity style={style.button} onPress={this.sendVerification}>
          <Text style={style.buttonText}>CONTINUE</Text>
        </TouchableOpacity>
      </>
    );
  };

  render() {
    return (
      <SafeAreaView style={style.container}>
        <StatusBar backgroundColor={Constants.backgroundColor} barStyle="light-content" />
        {this.state.currentStep()}
      </SafeAreaView>
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
    padding: 40,
    color: Constants.mainTextColor,
    fontSize: 30,
  },
  inputView: {
    margin: 40,
    paddingHorizontal: 20,
    width: "80%",
    backgroundColor: "white",
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
  },
  inputText: {
    height: 50,
    color: "black"
  },
  buttonText: {
    color: "white",
    lineHeight: 50,
  },
  button: {
    margin: 40,
    marginBottom: 150,
    width: "80%",
    backgroundColor: Constants.accentColorOne,
    borderRadius: 25,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});
