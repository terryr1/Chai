import React from "react";
import { FlatList, StatusBar, SafeAreaView, View, Text, TouchableOpacity, Alert } from "react-native";
import { ListItem } from "react-native-elements";
import MessageListController from "../Controllers/MessageListController";
import { Icon } from "react-native-elements";
import { SvgXml } from "react-native-svg";
import { unionWith, difference } from "lodash";
import Constants from "./../Constants";
import AsyncStorage from "@react-native-community/async-storage";
import LottieView from "lottie-react-native";

class MessageList extends React.Component {
  constructor(props) {
    super(props);
  }

  state = {
    data: [],
  };

  componentDidMount = async () => {
    // AsyncStorage.getItem("convos").then((convos) => {
    //   if (convos) {
    //     this.setState({ data: JSON.parse(convos) });
    //   }
    // });

    try {
      const convos = await AsyncStorage.getItem("convos");
      if (convos) {
        this.setState({ data: JSON.parse(convos) });
      }
    } catch (error) {
      console.log(error);
    }

    this._unsubscribeFocus = this.props.navigation.addListener("focus", () => {
      this._isMounted = true;
      // if (this.animation) {
      //   this.animation.play();
      // }
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
      titleStyle={{ color: "rgba(255, 255, 255, 1)", fontWeight: "bold", fontSize: 16 }}
      leftIcon={
        item.primary ? (
          <Icon name="face" type="material" color={Constants.mainTextColor} size={47} />
        ) : (
          <SvgXml
            xml={Constants.agent}
            width={47}
            height={47}
            fill={Constants.mainTextColor}
            color={Constants.mainTextColor}
          />
        )
      }
      underlayColor="rgba(255, 255, 255, .2)"
      onPress={() => this.onPress(item)}
      containerStyle={{
        paddingHorizontal: 0,
        marginHorizontal: 16,
        borderRadius: 1,
        backgroundColor: "rgba(0, 0, 0, 0)",
      }}
    />
  );

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Constants.backgroundColor }}>
        <StatusBar backgroundColor={Constants.backgroundColor} barStyle="light-content" />
        <LottieView
          style={{ zIndex: 1, position: "absolute", width: "100%", bottom: 0 }}
          ref={(animation) => {
            this.animation = animation;
          }}
          source={require("./../../resources/messagelist.json")}
        ></LottieView>
        <View
          style={{
            zIndex: 5,
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
            backgroundColor: "rgba(0,0,0,0)",
            paddingVertical: 20
          }}
        >
          <Text style={{ color: "white", fontSize: 30, marginLeft: 27, fontWeight: "bold" }}>Chats</Text>
          <TouchableOpacity onPress={() => Alert.alert("yo")}>
            <Icon style={{ marginRight: 10 }} name="more-vert" type="material" color="white" size={35} />
          </TouchableOpacity>
        </View>
        <View
          style={{
            flex: 1,
            zIndex: 5,
            marginLeft: 5,
            marginRight: 10,
            marginBottom: 10,
            borderRadius: 25,
            paddingBottom: 20,
          }}
        >
          <FlatList
            style={{
              zIndex: 5,
            }}
            keyExtractor={this.keyExtractor}
            data={this.state.data}
            renderItem={this.renderItem}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </SafeAreaView>
    );
  }
}

export default MessageList;
