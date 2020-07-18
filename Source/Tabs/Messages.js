import React from "react";
import MessageList from "../Components/MessageList";
import Convo from "../Components/Convo";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

class Messages extends React.Component {
  render() {

    // if(this.props.route.state && this.props.route.state.index > 0) {
    //   this.props.navigation.setOptions({tabBarVisible: false})
    // } else {
    //   this.props.navigation.setOptions({tabBarVisible: true})
    // }

    return (
      <Stack.Navigator
        initialRouteName="MessageList"
        screenOptions={{
          headerShown: false,
          animationEnabled: true
        }}
      >
        <Stack.Screen name="ConvoContainer" component={Convo} />
        <Stack.Screen
          name="MessageList"
          component={MessageList}
          initialParams={{
            user: {
              id: this.props.route.params.uid,
            },
          }}
        />
      </Stack.Navigator>
    );
  }
}

export default Messages;
