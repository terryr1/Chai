import React from 'react';
import { SafeAreaView, TextInput, Text, StatusBar, Button } from 'react-native';
import { ScreenContainer } from 'react-native-screens';
import { homeStyle } from '../index';
import CreateConvoController from '../Controllers/CreateConvoController'

class CreateConvo extends React.Component {

    state = {
        inputVal: ''
    }

    onChangeText = (val) => {
        this.setState({inputVal: val})
    }

    async sendMessage() {
        const convo_id = await CreateConvoController.create(this.state.inputVal, this.props.route.params.user.id);
        this.props.navigation.navigate('Convo', {id: convo_id, pending: true, user: this.props.route.params.user})
    }

    render() {
        return (
            <SafeAreaView style={homeStyle.container}>
                <StatusBar backgroundColor="black" barStyle='light-content' />
                <ScreenContainer style={{backgroundColor: 'black'}}>
                    <Text style={homeStyle.mainText}>
                            So what's on your mind?
                    </Text>
                    <TextInput
                        multiline
                        style={homeStyle.input}
                        onChangeText={this.onChangeText}
                        value={this.state.inputVal}
                    />
                    <Button onPress={this.sendMessage.bind(this)} title='send'/>
                </ScreenContainer>
            </SafeAreaView>
        )
    }
}

export default CreateConvo;