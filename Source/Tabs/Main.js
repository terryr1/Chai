import React from "react";
import Home from "./Home";
import Messages from "./Messages";
import Explore from "./Explore";
import { NavigationContainer, DefaultTheme, StackActions } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {Icon} from 'react-native-elements'
import AuthController from "../Controllers/AuthController";

//think of a way to pass in the user from App.js to the three tabs
//do something like run the start screen and create the user, then get the user from the db?

const Tabs = createBottomTabNavigator();

class Main extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <Tabs.Navigator
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
        }}
        tabBarOptions={{
          activeTintColor: "white",
          activeBackgroundColor: "black",
          inactiveBackgroundColor: "black",
          inactiveTintColor: "dimgray",
          showLabel: false,
          style: {
            backgroundColor: "black",
          },
          keyboardHidesTabBar: false,
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
            tabBarIcon: ({ color, size }) => (
              <Icon name="home" type="material" color={color} size={30} />
            ),
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
            tabBarIcon: ({ color, size }) => (
              <Icon name="forum" type="material" color={color} size={30} />
            ),
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
            tabBarIcon: ({ color, size }) => (
              <Icon name="search" type="material" color={color} size={30} />
            ),
          }}
        />
      </Tabs.Navigator>
    );
  }
}

export default Main;
