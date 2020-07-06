import React from 'react';
import ConvoCards from './../Components/ConvoCards';
import Convo from './../Components/Convo';
import { createStackNavigator } from '@react-navigation/stack'

const Stack = createStackNavigator();

class Explore extends React.Component {
    render() {
        return (
            <Stack.Navigator initialRouteName="ConvoCards" screenOptions={{
                headerShown: false
              }}>
                <Stack.Screen name = "Convo" component={Convo} />
                <Stack.Screen name = "ConvoCards" component={ConvoCards} 
                    initialParams={ {user: {
                        id: this.props.route.params.uid,
                    }}}
                />
            </Stack.Navigator>
        )
    }
}

export default Explore;