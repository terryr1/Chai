import React from "react";
import { FlatList, StatusBar, SafeAreaView } from "react-native";
import { ListItem } from "react-native-elements";
import MessageListController from "../Controllers/MessageListController";
import { Icon } from "react-native-elements";
import { SvgXml } from "react-native-svg";
import { unionWith, difference } from "lodash";
import Constants from "./../Constants";
import AsyncStorage from "@react-native-community/async-storage";

class MessageList extends React.Component {
  constructor(props) {
    super(props);
  }

  state = {
    data: [],
  };

  componentDidMount = async () => {
    AsyncStorage.getItem("convos").then((convos) => {
      if (convos) {
        this.setState({ data: JSON.parse(convos) });
      }
    });

    this._unsubscribeFocus = this.props.navigation.addListener("focus", () => {
      this._isMounted = true;
      this.startController();
    });

    this._unsubscribeBlur = this.props.navigation.addListener("blur", () => {
      this.onBlur();
    });
  };

  startController = () => {
    MessageListController.start((data) => {
      const diff = difference(this.state.data, data);
      diff.forEach((item) => {
        AsyncStorage.removeItem(item.convo_id);
      });
      if (this._isMounted) {
        this.setState({ data });
        AsyncStorage.setItem("convos", JSON.stringify(data));
      }
    }, "" + this.props.route.params.user.id);
  };

  onBlur = () => {
    this._isMounted = false;
    MessageListController.stop(this.props.route.params.user.id);
  };

  componentWillUnmount = () => {
    this.onBlur();
    this._unsubscribeFocus();
    this._unsubscribeBlur();
  };

  keyExtractor = (item, index) => index.toString();

  onPress = (item) => {
    this.props.navigation.navigate("ConvoContainer", {
      id: item.convo_id,
      user: { ...this.props.route.params.user, primary: item.primary },
    });
  };

  renderItem = ({ item }) => (
    <ListItem
      title={item.name}
      titleStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}
      leftIcon={
        item.primary ? (
          <Icon name="face" type="material" color="white" size={47} />
        ) : (
          <SvgXml xml={Constants.agent} width={47} height={47} fill="white" color="white" />
        )
      }
      onPress={() => this.onPress(item)}
      backgroundColor="black"
      containerStyle={{
        marginLeft: 5,
        marginRight: 5,
        marginTop: 5,
        borderWidth: 0,
        borderColor: "black",
        backgroundColor: "#fff",
      }}
      linearGradientProps={{
        colors: ["black", "black"],
        start: [1, 0],
        end: [0.2, 0],
      }}
      style={{ borderWidth: 0, borderColor: "black" }}
      chevron
    />
  );

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
        <StatusBar backgroundColor="black" barStyle="light-content" />
        <FlatList
          style={{ borderWidth: 0, borderColor: "black" }}
          keyExtractor={this.keyExtractor}
          data={this.state.data}
          renderItem={this.renderItem}
        />
      </SafeAreaView>
    );
  }
}

export default MessageList;
