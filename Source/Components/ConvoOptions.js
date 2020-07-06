
import React from 'react';
import { SafeAreaView, Text, Button, StatusBar, View } from 'react-native';
import { ScreenContainer } from 'react-native-screens';
import { ListItem } from 'react-native-elements';
import { homeStyle } from '../index';
import PendingConvoController from '../Controllers/PendingConvoController';
import GestureRecognizer from 'react-native-swipe-gestures'

//also have swipe left that goes back to a convo
class ConvoOptions extends React.Component {

    constructor(props) {
        super(props);
    }

    state = {
        inputVal: ''
    }

    onChangeText = (val) => {
        this.setState({inputVal: val})
    }

    onClick = () => {}

    async onSwipeLeft() {
        await PendingConvoController.switchPendingState(this.props.route.params.user.id, this.props.route.params.id);
        console.log(this.props.route.params.pending);
        this.props.navigation.replace('Convo', {id: this.props.route.params.id, user: this.props.route.params.user, pending: !this.props.route.params.pending})
    }

    onSwipeRight = () => {
        this.props.navigation.navigate('Convo', {id: this.props.route.params.id, user: this.props.route.params.user, pending: this.props.route.params.pending})
    }
     
    render() {
        return (
            <GestureRecognizer
                onSwipeLeft={(state) => this.onSwipeLeft()}
                onSwipeRight={(state) => this.onSwipeRight()}
                style={{
                flex: 1
                }}
                >
                <SafeAreaView style={homeStyle.container}>
                    <StatusBar backgroundColor="black" barStyle='light-content' />
                    <View style={{backgroundColor: 'black'}} >
                        <Text style = {{color: 'white'}}> Star Rating Goes Here </Text>
                        <Button onPress={this.onClick} title='resolve'/>
                        <Button onPress={this.onClick} title='new opinion'/>
                    </View>
                </SafeAreaView>
            </GestureRecognizer>
        );
    }

}

export default ConvoOptions;