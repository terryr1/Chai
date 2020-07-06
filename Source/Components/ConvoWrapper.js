
import React from 'react';
import { SafeAreaView, TextInput, Button, StatusBar } from 'react-native';
import { ScreenContainer } from 'react-native-screens';
import { ListItem } from 'react-native-elements';
import { homeStyle } from '../index';
import SetupController from '../Controllers/SetupController';

//This should contain a convo and convo options in stack navigator
class Setup extends React.Component {

    constructor(props) {
        super(props);
    }

    state = {
        inputVal: ''
    }

    onChangeText = (val) => {
        this.setState({inputVal: val})
    }

    createUser = () => {
        SetupController.createUser(this.state.inputVal);
        this.props.navigation.replace('Main', {uid: this.state.inputVal});
    }

    login = () => {
        this.props.navigation.replace('Main', {uid: this.state.inputVal});
    }

    render() {
        return (
            <SafeAreaView style={homeStyle.container}>
                <StatusBar backgroundColor="black" barStyle='light-content' />
                <ScreenContainer style={{backgroundColor: 'black'}}>
                    <TextInput
                        multiline
                        style={homeStyle.input}
                        onChangeText={this.onChangeText}
                        value={this.state.inputVal}
                    />
                    <Button onPress={this.createUser} title='create'/>
                    <Button onPress={this.login} title='login'/>
                </ScreenContainer>
            </SafeAreaView>
        )
    }
}

export default Setup;

{/* <GestureRecognizer
        onSwipe={(direction, state) => this.onSwipe(direction, state)}
        onSwipeUp={(state) => this.onSwipeUp(state)}
        onSwipeDown={(state) => this.onSwipeDown(state)}
        onSwipeLeft={(state) => this.onSwipeLeft(state)}
        onSwipeRight={(state) => this.onSwipeRight(state)}
        config={config}
        style={{
          flex: 1,
          backgroundColor: this.state.backgroundColor
        }}
        >
        <Text>{this.state.myText}</Text>
        <Text>onSwipe callback received gesture: {this.state.gestureName}</Text>
      </GestureRecognizer> */}