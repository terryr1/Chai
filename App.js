import React from "react";
import Main from "./Source/Tabs/Main";
import Setup from "./Source/Components/Setup";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { decode, encode } from "base-64";
import AuthController from "./Source/Controllers/AuthController";

//fixed a random error------
if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}
// ------------------------

//think of a way to pass in the user from App.js to the three tabs
//do something like run the start screen and create the user, then get the user from the db?

const Stack = createStackNavigator();

class App extends React.Component {
  constructor() {
    super();
    this.MyTheme = {
      dark: true,
      colors: {
        primary: "rgb(255, 255, 255)",
        background: "rgb(0, 0, 0)",
        card: "rgb(64, 64, 64)",
        text: "rgb(255, 255, 255)",
        border: "rgb(0, 0, 0)",
      },
    };
  }

  state = {
    user: false,
  };

  async componentDidMount() {
    AuthController.shared.checkForAuthentication((user) => {
      if (user) {
        this.setState({ user });
      } else {
        this.setState({ user: "noUser" });
      }
    });
  }

  render() {
    if (!this.state.user) {
      //make this a loading screen
      return <></>;
    }

    return (
      <NavigationContainer theme={this.MyTheme}>
        <Stack.Navigator
          initialRouteName={this.state.user == "noUser" ? "Setup" : "Main"}
          screenOptions={{
            headerShown: false,
            animationEnabled: true,
          }}
        >
          <Stack.Screen
            name="Main"
            component={Main}
            initialParams={{ uid: this.state.user == "noUser" ? null : this.state.user.uid }}
          />
          <Stack.Screen name="Setup" component={Setup} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

export default App;
