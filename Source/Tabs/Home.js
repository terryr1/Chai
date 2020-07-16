import React from "react";
import { SafeAreaView, TextInput, Text, StatusBar } from "react-native";
import { ScreenContainer } from "react-native-screens";
import { homeStyle } from "./../index";
import CreateConvo from "../Components/CreateConvo";
import ConvoContainer from "../Components/ConvoContainer";
import { createStackNavigator } from "@react-navigation/stack";
import { useFocusEffect } from "@react-navigation/native";

const Stack = createStackNavigator();

function ResetScreenOnBlur({ navigation }) {
  useFocusEffect(
    React.useCallback(() => {
      return () => navigation.setParams({ screen: "CreateConvo" });
    }, [navigation])
  );

  return null;
}

class Home extends React.Component {
  render() {

    if(this.props.route.state && this.props.route.state.index > 0) {
      this.props.navigation.setOptions({tabBarVisible: false})
    } else {
      this.props.navigation.setOptions({tabBarVisible: true})
    }

    return (
      <>
        <ResetScreenOnBlur navigation={this.props.navigation} />
        <Stack.Navigator
          initialRouteName="CreateConvo"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="ConvoContainer" component={ConvoContainer} />
          <Stack.Screen
            name="CreateConvo"
            component={CreateConvo}
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

export default Home;
