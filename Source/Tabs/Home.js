import React from 'react';
import { SafeAreaView, TextInput, Text, StatusBar } from 'react-native';
import { ScreenContainer } from 'react-native-screens';
import { homeStyle } from './../index';
import CreateConvo from '../Components/CreateConvo';
import Convo from '../Components/Convo'
import { createStackNavigator } from '@react-navigation/stack'

const Stack = createStackNavigator();

class Home extends React.Component {
    render() {
        return (
            <Stack.Navigator initialRouteName="CreateConvo" screenOptions={{
                headerShown: false
              }}>
                <Stack.Screen name = "Convo" component={Convo} />
                <Stack.Screen name = "CreateConvo" component={CreateConvo} 
                    initialParams={ {user: {
                        id: this.props.route.params.uid,
                    }}}
                />
            </Stack.Navigator>
        )
    }
}

export default Home;