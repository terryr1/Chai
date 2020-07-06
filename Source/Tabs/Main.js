import React from 'react';
import Home from './Home';
import Messages from './Messages';
import Explore from './Explore';
import { NavigationContainer, DefaultTheme, StackActions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StatusBar } from 'react-native';
import {decode, encode} from 'base-64'

//think of a way to pass in the user from App.js to the three tabs
//do something like run the start screen and create the user, then get the user from the db?

const Tabs = createBottomTabNavigator();

class Main extends React.Component {

  constructor() {
    super();
  }

  render() {
      return (
          <Tabs.Navigator screenOptions={{
            headerShown: false
          }} tabBarOptions=   {{activeTintColor: 'white', 
                                activeBackgroundColor: 'black', 
                                inactiveBackgroundColor: 'black', 
                                inactiveTintColor: 'dimgray', 
                                showLabel: true, 
                                style: {
                                    backgroundColor: 'black',
                                }}}>
            <Tabs.Screen 
                name="Home" 
                component={Home} 
                initialParams = {{
                    uid: this.props.route.params.uid
                }}
                // options={{
                //   tabBarLabel: s'Home',
                //   tabBarIcon: ({ color, size }) => (
                //     <MaterialCommunityIcons name="home" color={color} size={size} />
                //   ),
                // }}
            />
            <Tabs.Screen name="Messages" component={Messages} 
                initialParams = {{
                    uid: this.props.route.params.uid
                }}
            />
            <Tabs.Screen name="Explore" component={Explore}
                initialParams = {{
                    uid: this.props.route.params.uid
                }} 
            />
        </Tabs.Navigator>
      );
  }
}

export default Main;