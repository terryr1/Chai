import React from "react";
import { SafeAreaView, TextInput, Button, StatusBar } from "react-native";
import { ScreenContainer } from "react-native-screens";
import { ListItem } from "react-native-elements";
import { homeStyle } from "../index";
import AuthController from "../Controllers/AuthController";

class Setup extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidUpdate() {
    if (this.state.user) {
      //get correct uid/ figure out how to store uids
      console.log("found user " + this.state.user.uid)
      this.props.navigation.replace("Main", { uid: this.state.user.uid });
    }
  }

  componentDidMount() {
    AuthController.shared.checkForAuthentication(user => this.setState({user: user}))
    console.log("done mounting")
  }

  state = {
    phoneNumber: "",
    code: "",
    user: null
  };

  onChangePhoneNumber = (val) => {
    this.setState({ phoneNumber: val });
  };

  onChangeCode = (val) => {
    this.setState({ code: val });
  };

  sendVerification = async () => {
    console.log("hii");
    await AuthController.shared.sendVerification(this.state.phoneNumber);
  };

  confirmCode = async () => {
    const result = await AuthController.shared.confirmCode(this.state.code);
    if (result) {
      //get correct uid/ figure out how to store uids
      this.props.navigation.replace("Main", { uid: this.state.user.uid });
    } else {
      console.log("FAILED");
    }
  };

  render() {
    return (
      <SafeAreaView>
        <StatusBar backgroundColor="black" barStyle="light-content" />
        {AuthController.shared.getCaptcha()}
        <TextInput
          keyboardType="phone-pad"
          style={{ color: "white" }}
          onChangeText={this.onChangePhoneNumber}
          value={this.state.phoneNumber}
        />
        <Button onPress={this.sendVerification} title="send text" />
        <TextInput style={{ color: "white" }} keyboardType="number-pad" onChangeText={this.onChangeCode} value={this.state.code} />
        <Button onPress={this.confirmCode} title="enter code" />
      </SafeAreaView>
    );
  }
}

export default Setup;
