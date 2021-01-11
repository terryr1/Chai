import React from "react";
import {
  Animated,
  FlatList,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  StyleSheet,
  ScrollView,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import SideMenu from "react-native-side-menu";
import { ListItem, Avatar } from "react-native-elements";
import MessageListController from "../Controllers/MessageListController";
import { Icon, withBadge, Badge } from "react-native-elements";
import { SvgXml } from "react-native-svg";
import { difference } from "lodash";
import Constants from "./../Constants";
import AsyncStorage from "@react-native-community/async-storage";
import AuthController from "../Controllers/AuthController";
import SafeAreaView from "react-native-safe-area-view";

function DrawerContent(props) {
  const style = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: "column-reverse",
      backgroundColor: Constants.backgroundColor,
    },
    buttonText: {
      color: Constants.mainTextColor,
      fontSize: 22,
      lineHeight: 50,
    },
    button: {
      marginHorizontal: 40,
      marginVertical: 5,
      width: "80%",
      borderRadius: 15,
      height: 50,
      alignItems: "flex-end",
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
        paddingTop: Platform.OS === "android" ? "5%" : "15%",
      }}
    >
      <SafeAreaView style={style.container}>
        <TouchableOpacity
          style={style.button}
          onPress={async () => {
            await Linking.openURL("https://www.chaitheapp.com/home");
          }}
        >
          <Text style={style.buttonText}>HELP</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={style.button}
          onPress={async () => {
            await Linking.openURL("https://www.chaitheapp.com/privacy-policy");
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
      </SafeAreaView>
    </ScrollView>
  );
}

class MessageList extends React.Component {
  state = {
    data: false,
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
      const compareTimeStamp = (a, b) => b.last_updated - a.last_updated;
      const data = unsorted_data.sort(compareTimeStamp);
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
    if (this.stopController) this.stopController();
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
      clearNotifications: this.props.route.params.clearNotifications,
    });
  };

  renderItem = ({ item }) => {
    const BadgedAvatar = item.unread
      ? withBadge("", {
          badgeStyle: { backgroundColor: "#946FA6", borderColor: "#946FA6", borderWidth: 7, borderRadius: 7 },
        })(Avatar)
      : Avatar;

    return (
      <ListItem
        underlayColor="rgba(255, 255, 255, .2)"
        onPress={() => this.onPress(item)}
        containerStyle={{
          paddingHorizontal: 5,
          marginHorizontal: 16,
          borderRadius: 1,
          backgroundColor: "rgba(0, 0, 0, 0)",
        }}
      >
        {item.primary ? (
          <BadgedAvatar
            size="medium"
            overlayContainerStyle={{ backgroundColor: Constants.accentColorOne }}
            rounded
            icon={{ name: "person", type: "material", size: 30 }}
          />
        ) : (
          <BadgedAvatar
            size="medium"
            overlayContainerStyle={{ backgroundColor: Constants.accentColorTwo }}
            rounded
            icon={{ name: "record-voice-over", type: "material" }}
          />
        )}
        <Text
          style={{
            color: Constants.mainTextColor,
            fontWeight: item.unread ? "bold" : "normal",
            fontSize: 16,
            width: "80%",
          }}
          numberOfLines={1}
        >
          {item.name}
        </Text>
      </ListItem>
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

  signOut = async () => {
    const success = MessageListController.clearNotificationToken();
    if (success) {
      this.props.navigation.replace("Setup");
      console.log("SIGN OUT");
      this.onBlur();
      AuthController.shared.signOut();
    } else {
      Alert.alert("Sign out failed, try again");
    }
  };

  displayList = () => {
    if (this.state.data) {
      return this.state.data.length > 0 ? (
        <View
          style={{
            flex: 1,
            zIndex: 5,
            marginLeft: 5,
            marginRight: 10,
            marginBottom: 0,
            borderRadius: 25,
            paddingBottom: 0,
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
              fontWeight: "normal",
              fontSize: 20,
              textAlign: "center",
              lineHeight: 30,
            }}
          >
            Looks like there's nothing here, join a conversation in the explore tab or start your own conversation in
            the home tab.
          </Text>
        </View>
      );
    }
  };

  render() {
    const menu = <DrawerContent deleteAccount={this.deleteAccount} signOut={this.signOut} />;

    return (
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
        <SafeAreaView forceInset={{ top: "always" }} style={{ flex: 1, backgroundColor: Constants.backgroundColor }}>
          <StatusBar backgroundColor={Constants.backgroundColor} barStyle="light-content" />
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
              <Icon style={{ marginRight: 27, marginTop: 0 }} name="menu" type="material" color="white" size={35} />
            </TouchableOpacity>
          </View>
          {this.displayList()}
        </SafeAreaView>
      </SideMenu>
    );
  }
}

export default MessageList;
