import React from "react";
import Convo from "./Convo";
import { TextInput, View, FlatList, StatusBar, SafeAreaView } from "react-native";
import { ListItem } from "react-native-elements";
import MessageListController from "../Controllers/MessageListController";
import { registerCustomIconType, Icon } from "react-native-elements";
import { SvgXml } from "react-native-svg"

const agent = `<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" viewBox="0 0 24 24" fill="black" width="18px" height="18px"><g><rect fill="none" height="24" width="24"/></g><g><g><path d="M21,12.22C21,6.73,16.74,3,12,3c-4.69,0-9,3.65-9,9.28C2.4,12.62,2,13.26,2,14v2c0,1.1,0.9,2,2,2h1v-6.1 c0-3.87,3.13-7,7-7s7,3.13,7,7V19h-8v2h8c1.1,0,2-0.9,2-2v-1.22c0.59-0.31,1-0.92,1-1.64v-2.3C22,13.14,21.59,12.53,21,12.22z"/><circle cx="9" cy="13" r="1"/><circle cx="15" cy="13" r="1"/><path d="M18,11.03C17.52,8.18,15.04,6,12.05,6c-3.03,0-6.29,2.51-6.03,6.45c2.47-1.01,4.33-3.21,4.86-5.89 C12.19,9.19,14.88,11,18,11.03z"/></g></g></svg>`;
const AgentSvg = () => <SvgXml xml={agent} width={40} height={40} fill="white" color="white"/>

class MessageList extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this._unsubscribeFocus = this.props.navigation.addListener("focus", () => {
      this._isMounted = true;
      MessageListController.start((data) => {
        if (this._isMounted) {
          this.setState({ data });
        }
      }, "" + this.props.route.params.user.id);
    });

    this._unsubscribeBlur = this.props.navigation.addListener("blur", () => {
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
      user: { ...this.props.route.params.user, primary: item.primary },
    });
  };

  renderItem = ({ item }) => (
    //add in support agent
    <ListItem
      title={item.name}
      titleStyle={{ color: "white", fontWeight: "bold" }}
      leftIcon={item.primary ? <Icon name="face" type="material" color="white" size={40} /> : <AgentSvg />} 
      onPress={() => this.onPress(item)}
      backgroundColor="black"
      containerStyle={{ marginLeft: 5, marginRight: 5, marginTop: 5, borderWidth: 0, backgroundColor: "#fff" }}
      linearGradientProps={{
        colors: ["black", "black"],
        start: [1, 0],
        end: [0.2, 0],
      }}
      style={{ borderBottomWidth: 0 }}
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
