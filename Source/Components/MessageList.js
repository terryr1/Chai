import React from "react";
import Convo from "./Convo";
import { TextInput, View, FlatList, StatusBar, SafeAreaView } from "react-native";
import { ScreenContainer } from "react-native-screens";
import { ListItem } from "react-native-elements";
import { homeStyle } from "../index";
import MessageListController from "../Controllers/MessageListController";

class MessageList extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {

    this._unsubscribeFocus = this.props.navigation.addListener('focus', () => {
      this._isMounted = true;
      MessageListController.start((data) => {
        if (this._isMounted) {
          this.setState({ data });
        }
      }, "" + this.props.route.params.user.id);
    })
    

    this._unsubscribeBlur = this.props.navigation.addListener('blur', () => {
      this._isMounted = false;
      MessageListController.stop(this.props.route.params.user.id);
    });
  }

  componentWillUnmount() {
    this._unsubscribeFocus();
    this._unsubscribeBlur();
  }

  state = {
    data: [],
  };

  //(item, index) refers to the data list we give to FlatList
  keyExtractor = (item, index) => index.toString();

  onPress = (item) => {
    this.props.navigation.navigate("ConvoContainer", {
      id: item.convo_id,
      pending: item.pending,
      user: {...this.props.route.params.user, primary: item.primary},
    });
  };

  renderItem = ({ item }) => (
    <ListItem
      title={item.name}
      titleStyle={{ color: 'white', fontWeight: 'bold' }}
      leftIcon={{ name:"face", type:"material", color: "white", size: 40}}
      onPress={() => this.onPress(item)}
      backgroundColor="black"
      containerStyle = {{ marginLeft: 5,
        marginRight: 5, 
        marginTop: 5, 
        borderWidth: 0,
        backgroundColor: '#fff' }}
      linearGradientProps={{
        colors: ['black', 'black'],
        start: [1, 0],
        end: [0.2, 0],
      }}
      style={{borderBottomWidth: 0}}
      chevron
    />
  );

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
        <StatusBar backgroundColor="black" barStyle="light-content" />
        <FlatList keyExtractor={this.keyExtractor} data={this.state.data} renderItem={this.renderItem} />
      </SafeAreaView>
    );
  }
}

export default MessageList;
