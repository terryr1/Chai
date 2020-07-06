import React from 'react';
import MessageList from '../Components/MessageList'
import Convo from '../Components/Convo'
import ConvoOptions from '../Components/ConvoOptions'
import { createStackNavigator } from '@react-navigation/stack'

const Stack = createStackNavigator();

class Messages extends React.Component {
    render() {
        return (
            <Stack.Navigator initialRouteName="MessageList" screenOptions={{
                headerShown: false
              }}>
                <Stack.Screen name = "Convo" component={Convo} />
                <Stack.Screen name = "ConvoOptions" component={ConvoOptions} />
                <Stack.Screen name = "MessageList" component={MessageList}
                    initialParams={ {user: {
                        id: this.props.route.params.uid,
                    }}}
                />
            </Stack.Navigator>
        )
    }
}

export default Messages;