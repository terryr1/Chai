import React from "react";
import {
  Animated,
  FlatList,
  StatusBar,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  StyleSheet,
  ScrollView,
  Linking,
} from "react-native";
import SideMenu from "react-native-side-menu";
import { ListItem } from "react-native-elements";
import MessageListController from "../Controllers/MessageListController";
import { Icon, withBadge, Badge } from "react-native-elements";
import { SvgXml } from "react-native-svg";
import { difference } from "lodash";
import Constants from "./../Constants";
import AsyncStorage from "@react-native-community/async-storage";
import LottieView from "lottie-react-native";
import AuthController from "../Controllers/AuthController";

function DrawerContent(props) {
  const style = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Constants.backgroundColor,
    },
    buttonText: {
      color: "white",
      lineHeight: 50,
    },
    button: {
      margin: 40,
      width: "80%",
      borderRadius: 15,
      backgroundColor: Constants.accentColorOne,
      height: 50,
      alignItems: "center",
    },
  });

  return (
    <ScrollView
      scrollsToTop={false}
      style={{
        flex: 1,
        width: window.width,
        height: window.height,
        backgroundColor: Constants.backgroundColor,
        padding: 20,
      }}
    >
      <SafeAreaView style={style.container}>
        <TouchableOpacity
          style={style.button}
          onPress={async () => {
            await Linking.openURL("https://sites.google.com/view/chaitheapp/home");
          }}
        >
          <Text style={style.buttonText}>HELP</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={style.button}
          onPress={async () => {
            await Linking.openURL("https://sites.google.com/view/chaitheapp/home");
          }}
        >
          <Text style={style.buttonText}>PRIVACY POLICY</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={style.button}
          onPress={() => {
            props.signOut();
          }}
        >
          <Text style={style.buttonText}>SIGN OUT</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ ...style.button, backgroundColor: Constants.accentColorTwo }}
          onPress={() => {
            props.deleteAccount();
          }}
        >
          <Text style={style.buttonText}>DELETE ACCOUNT</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ScrollView>
  );
}

class MessageList extends React.Component {
  state = {
    data: [],
  };

  componentDidMount = async () => {
    AsyncStorage.getItem("convos").then((convos) => {
      if (convos != null) {
        this.setState({ data: JSON.parse(convos) });
      }
    });

    this._unsubscribeFocus = this.props.navigation.addListener("focus", async () => {
      this._isMounted = true;
      this.startController();
    });

    this._unsubscribeBlur = this.props.navigation.addListener("blur", () => {
      this.onBlur();
    });
  };

  startController = async () => {
    this.stopController = await MessageListController.start((unsorted_data) => {
      //should sort by unread first, then have all thos at top, then alphebatically?
      const compareLoc = (a, b) => a.name.localeCompare(b.name);
      const data = [
        ...unsorted_data.filter((convo) => convo.unread).sort(compareLoc),
        ...unsorted_data.filter((convo) => !convo.unread).sort(compareLoc),
      ];
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
    this.stopController();
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
      unread: item.unread,
    });
  };

  renderItem = ({ item }) => {
    const BadgedIcon = item.unread
      ? withBadge("", { badgeStyle: { backgroundColor: "#946FA6", borderColor: "#946FA6" } })(Icon)
      : Icon;
    const BadgedAssistantIcon = item.unread
      ? withBadge("", { badgeStyle: { backgroundColor: "#946FA6", borderColor: "#946FA6" } })(SvgXml)
      : SvgXml;

    return (
      <ListItem
        title={item.name}
        titleStyle={{ color: Constants.mainTextColor, fontWeight: "bold", fontSize: 16 }}
        leftIcon={
          item.primary ? (
            <BadgedIcon name="face" type="material" color={Constants.mainTextColor} size={45} />
          ) : (
            <BadgedAssistantIcon
              xml={Constants.agent}
              width={45}
              height={45}
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
  };

  updateMenuState = (isOpen) => {
    this.setState({ isOpen });
  };

  deleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action is irreversible and will delete all conversations associated with your account.",
      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "OK",
          onPress: () => {
            //this.props.navigation.replace("Setup");
            this.onBlur();
            AuthController.shared.deleteUser();
          },
        },
      ]
    );
  };

  signOut = () => {
    this.props.navigation.replace("Setup");
    console.log("SIGN OUT");
    this.onBlur();
    AuthController.shared.signOut();
  };

  render() {
    const menu = <DrawerContent deleteAccount={this.deleteAccount} signOut={this.signOut} />;

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Constants.backgroundColor }}>
        <SideMenu
          animationFunction={(prop, value) =>
            Animated.spring(prop, {
              toValue: value,
              friction: 8,
              useNativeDriver: true,
            })
          }
          menu={menu}
          menuPosition="right"
          openMenuOffset={Constants.SCREEN_WIDTH - 50}
          edgeHitWidth={Constants.SCREEN_WIDTH}
          isOpen={this.state.isOpen}
          onChange={(isOpen) => this.updateMenuState(isOpen)}
        >
          <View style={{ flex: 1, backgroundColor: Constants.backgroundColor }}>
            <StatusBar backgroundColor={Constants.backgroundColor} barStyle="light-content" />
            <LottieView
              style={{ zIndex: 1, position: "absolute", width: "100%", bottom: Platform.OS === "android" ? 30 : 70 }}
              source={require("./../../resources/messagelist.json")}
            ></LottieView>
            <View
              style={{
                zIndex: 5,
                width: "100%",
                flexDirection: "row",
                justifyContent: "space-between",
                backgroundColor: "rgba(0,0,0,0)",
                paddingVertical: 20,
              }}
            >
              <Text style={{ color: "white", fontSize: 30, marginLeft: 27, fontWeight: "bold" }}>Chats</Text>
              <TouchableOpacity onPress={() => this.updateMenuState(true)}>
                <Icon style={{ marginRight: 27, marginTop: 4 }} name="menu" type="material" color="white" size={35} />
              </TouchableOpacity>
            </View>
            {this.state.data.length > 0 ? (
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
            ) : (
              <View
                style={{
                  flex: 1,
                  zIndex: 5,
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 70,
                }}
              >
                <Text
                  style={{
                    color: Constants.mainTextColor,
                    backgroundColor: "black",
                    borderRadius: 15,
                    overflow: "hidden",
                    padding: 20,
                    fontWeight: "bold",
                    fontSize: 20,
                    textAlign: "center",
                    lineHeight: 30,
                  }}
                >
                  Looks like there's nothing here, join a conversation in the explore tab or start your own conversation
                  in the home tab.
                </Text>
              </View>
            )}
          </View>
        </SideMenu>
      </SafeAreaView>
    );
  }
}

export default MessageList;
