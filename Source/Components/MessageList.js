import React from 'react';
import Convo from './Convo';
import { TextInput, View, FlatList, StatusBar, SafeAreaView } from 'react-native';
import { ScreenContainer } from 'react-native-screens';
import { ListItem } from 'react-native-elements';
import { homeStyle } from '../index';
import MessageListController from '../Controllers/MessageListController';

class MessageList extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this._isMounted = true
        MessageListController.start(data => {if (this._isMounted) {this.setState({data})}}, 
                                    '' + this.props.route.params.user.id);
    }

    componentWillUnmount() {
        this._isMounted = false;
        MessageListController.stop(this.props.route.params.user.id);
    }

    state = {
        data: [],
    };

    //(item, index) refers to the data list we give to FlatList
    keyExtractor = (item, index) => index.toString()

    onPress = (item) => {
        console.log(item)
        this.props.navigation.navigate('Convo', {id: item.convo_id, pending: item.pending, user: this.props.route.params.user})
    }

    renderItem = ({ item }) => (
        <ListItem
            title={item.name}
            leftAvatar={{source: {uri: null}}}
            onPress={() => this.onPress(item)}
            bottomDivider
            chevron
        />
    )

    render() {
        return (
            <SafeAreaView  style={{flex: 1, backgroundColor: "black"}}>
                <StatusBar backgroundColor="black" barStyle='light-content'/>
                <FlatList
                    keyExtractor={this.keyExtractor}
                    data={this.state.data}
                    renderItem={this.renderItem}
                />
            </SafeAreaView>
        )
    }
}

export default MessageList;