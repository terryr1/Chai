import React from "react";
import Home from "./Home";
import Messages from "./Messages";
import Explore from "./Explore";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon } from "react-native-elements";
import Constants from "../Constants";

const Tabs = createBottomTabNavigator();

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
          component={Home}
          unmountOnBlur={true}
          initialParams={{
            uid: this.props.route.params.uid,
          }}
          options={{
            tabBarIcon: ({ color }) => <Icon name="home" type="material" color={color} size={30} />,
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
            tabBarIcon: ({ color }) => <Icon name="forum" type="material" color={color} size={30} />,
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
            tabBarIcon: ({ color }) => <Icon name="search" type="material" color={color} size={30} />,
          }}
        />
      </Tabs.Navigator>
    );
  }
}

export default Main;
