import React from "react";
import Home from "./Home";
import Messages from "./Messages";
import Explore from "./Explore";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon } from "react-native-elements";
import { Alert } from "react-native";
import Constants from "../Constants";

const Tabs = createBottomTabNavigator();

//how notifications are handled while the app is open

class Main extends React.Component {
  constructor() {
    super();
  }

  componentDidMount = () => {
    if (this.props.route.params.notificationData) {
      this.props.navigation.navigate("Main", {
        screen: "Messages",
        params: {
          screen: "ConvoContainer",
          params: {
            id: this.props.route.params.notificationData.convo_id,
            pending: this.props.route.params.notificationData.pending,
            user: { id: this.props.route.params.uid, primary: this.props.route.params.notificationData.primary },
          },
        },
      });
    }
  };

  // handleResponse = (response) => {
  //   Alert.alert(JSON.stringify(response.notification.request.content));
  //   Alert.alert(JSON.stringify(response.notification.request.content.data));
  //   if (response.notification.request.content.data.convo_id) {
  //     const { convo_id, primary, pending } = response.notification.request.content.data;

  //     this.props.navigation.navigate("Messages", {
  //       screen: "ConvoContainer",
  //       params: { id: convo_id, pending, user: { uid: this.props.route.params.uid, primary: primary } },
  //     });
  //   }
  // };

  render() {
    return (
      <Tabs.Navigator
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
        }}
        tabBarOptions={{
          activeTintColor: Constants.mainTextColor,
          activeBackgroundColor: Constants.backgroundColor,
          inactiveBackgroundColor: Constants.backgroundColor,
          inactiveTintColor: "dimgray",
          showLabel: false,
          style: {
            backgroundColor: Constants.backgroundColor,
            height: 70,
          },
        }}
      >
        <Tabs.Screen
          name="Home"
          unmountOnBlur={true}
          component={Home}
          initialParams={{
            uid: this.props.route.params.uid,
          }}
          options={{
            tabBarIcon: ({ color, size }) => <Icon name="home" type="material" color={color} size={30} />,
          }}
        />
        <Tabs.Screen
          name="Messages"
          component={Messages}
          unmountOnBlur={true}
          initialParams={{
            uid: this.props.route.params.uid,
          }}
          options={{
            tabBarIcon: ({ color, size }) => <Icon name="forum" type="material" color={color} size={30} />,
          }}
        />
        <Tabs.Screen
          name="Explore"
          component={Explore}
          unmountOnBlur={true}
          initialParams={{
            uid: this.props.route.params.uid,
          }}
          options={{
            tabBarIcon: ({ color, size }) => <Icon name="search" type="material" color={color} size={30} />,
          }}
        />
      </Tabs.Navigator>
    );
  }
}

export default Main;
