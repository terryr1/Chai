import React from "react";
import MessageList from "../Components/MessageList";
import ConvoContainer from "../Components/ConvoContainer";
import { createStackNavigator } from "@react-navigation/stack";
import { useFocusEffect } from "@react-navigation/native";

const Stack = createStackNavigator();

function ResetScreenOnBlur({ navigation }) {
  useFocusEffect(
    React.useCallback(() => {
      return () => navigation.setParams({ screen: "MessageList" });
    }, [navigation])
  );

  return null;
}

class Messages extends React.Component {
  render() {
    return (
      <>
        <ResetScreenOnBlur navigation={this.props.navigation} />
        <Stack.Navigator
          initialRouteName="MessageList"
          screenOptions={{
            headerShown: false,
            animationEnabled: true,
          }}
        >
          <Stack.Screen name="ConvoContainer" component={ConvoContainer} />
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
      </>
    );
  }
}

export default Messages;
