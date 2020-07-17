import React from "react";
import ConvoCards from "./../Components/ConvoCards";
import ConvoContainer from "./../Components/ConvoContainer";
import { createStackNavigator } from "@react-navigation/stack";
import { useFocusEffect } from "@react-navigation/native";
import Convo from './../Components/Convo'

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

    // if(this.props.route.state && this.props.route.state.index > 0) {
    //   this.props.navigation.setOptions({tabBarVisible: false})
    // } else {
    //   this.props.navigation.setOptions({tabBarVisible: true})
    // }

    return (
      <>
        <ResetScreenOnBlur navigation={this.props.navigation} />
        <Stack.Navigator
          initialRouteName="ConvoCards"
          screenOptions={{
            headerShown: false,
            animationEnabled: false
          }}
        >
          <Stack.Screen name="ConvoContainer" component={ConvoContainer} />
          <Stack.Screen name="Convo" component={Convo} />
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
