import React from "react";
import ConvoCards from "./../Components/ConvoCards";
import ConvoContainer from "./../Components/ConvoContainer";
import { createStackNavigator } from "@react-navigation/stack";
import { useFocusEffect } from "@react-navigation/native";

const Stack = createStackNavigator();

function ResetScreenOnBlur({ navigation }) {
  useFocusEffect(
    React.useCallback(() => {
      return () => navigation.setParams({ screen: "ConvoCards" });
    }, [navigation])
  );

  return null;
}

class Explore extends React.Component {
  render() {
    return (
      <>
        <ResetScreenOnBlur navigation={this.props.navigation} />
        <Stack.Navigator
          initialRouteName="ConvoCards"
          screenOptions={{
            headerShown: false,
            animationEnabled: true,
          }}
        >
          <Stack.Screen name="ConvoContainer" component={ConvoContainer} />
          <Stack.Screen
            name="ConvoCards"
            component={ConvoCards}
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

export default Explore;
