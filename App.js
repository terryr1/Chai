import React from "react";
import Main from "./Source/Tabs/Main";
import Setup from "./Source/Components/Setup";
import { NavigationContainer, DefaultTheme, StackActions } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { View } from "react-native";
import { decode, encode } from "base-64";

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

  render() {
    return (
      <NavigationContainer theme={this.MyTheme}>
        <Stack.Navigator
          initialRouteName="Setup"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Main" component={Main} />
          <Stack.Screen name="Setup" component={Setup} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

export default App;
