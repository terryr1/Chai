import React from "react";
import { SafeAreaView, TextInput, Button, StatusBar, Linking, Text } from "react-native";
import { ScreenContainer } from "react-native-screens";
import { ListItem } from "react-native-elements";
import { homeStyle } from "../index";
import AuthController from "../Controllers/AuthController";



function StepThree()

function StepTwo()

function StepOne({}) {

}

class Setup extends React.Component {
  constructor(props) {
    super(props);
    this.getUrl()
    this.enteredEmail = ''
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
    Linking.addEventListener('url', (event) => {AuthController.shared.confirmLink(this.enteredEmail, event.url)})
    console.log("done mounting")
  }

  state = {
    email: "",
    code: "",
    user: null,
    initialUrl: ""
  };

  onChangeEmail = (val) => {
    this.setState({ email: val });
  };

  onChangeCode = (val) => {
    this.setState({ code: val });
  };

  sendVerification = async () => {
    this.enteredEmail = this.state.email
    const isVerified = await AuthController.shared.sendVerification(this.state.email);
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

  getUrl = async () => {
    const url = await Linking.getInitialURL()
    this.setState({initialUrl: url})
  }

  //make this two pages -> first enter email -> page that says click the verification link
  render() {
    return (
      <SafeAreaView>
        <StatusBar backgroundColor="black" barStyle="light-content" />
        {AuthController.shared.getCaptcha()}
        <TextInput
          keyboardType='email-address'
          style={{ color: "white" }}
          onChangeText={this.onChangeEmail}
          value={this.state.email}
        />
        <Button onPress={this.sendVerification} title="send text" />
        <Text style={{color: 'white'}}>{this.state.initialUrl}</Text>
      </SafeAreaView>
    );
  }
}

export default Setup;
