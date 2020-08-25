import React from "react";
import {
  TextInput,
  StatusBar,
  Button,
  StyleSheet,
  View,
  Animated,
  SafeAreaView,
  PixelRatio,
  ActivityIndicator,
  ImageBackground,
  Text,
} from "react-native";
import CreateConvoController from "../Controllers/CreateConvoController";
import LottieView from "lottie-react-native";
import Constants from "./../Constants";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Icon } from "react-native-elements";
//import Svg, { Text } from "react-native-svg";

class CreateConvo extends React.Component {
  state = {
    inputVal: "",
    progress: new Animated.Value(0),
    val: 0,
  };

  onChangeText = (val) => {
    this.setState({ inputVal: val });
  };

  sendMessage = async () => {
    const convo_id = await CreateConvoController.create(this.state.inputVal, this.props.route.params.user.id);
    this.setState({ inputVal: "", loading: false });
    this.props.navigation.navigate("ConvoContainer", {
      id: convo_id,
      pending: true,
      user: { ...this.props.route.params.user, primary: true },
    });
  };

  componentDidMount = () => {
    this._unsubscribeFocus = this.props.navigation.addListener("focus", async () => {
      if (this.animation) {
        this.animation.play();
      }
    });

    this._unsubscribeBlur = this.props.navigation.addListener("blur", async () => {
      this.state.progress.stopAnimation();
    });
  };

  componentWillUnmount = () => {
    this._unsubscribeFocus();
    this._unsubscribeBlur();
  };

  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar backgroundColor={Constants.backgroundColor} barStyle="light-content" />
        <LottieView
          style={{ marginBottom: -50, position: "absolute", width: "100%" }}
          ref={(animation) => {
            this.animation = animation;
          }}
          source={require("./../../resources/tea-anim3.json")}
        ></LottieView>
        <View style={style.container}>
          {/* <Svg height="60" width="400" style={{ bottom: 150 }}>
            <Text fill="black" stroke="black" fontSize="30" strokeWidth="0" fontWeight="bold" x="180" y="30" textAnchor="middle">
              So, what's on your mind?
            </Text>
          </Svg> */}
          <Text
            style={{
              bottom: "22%",
              fontSize: 30,
              color: "rgba(255, 255, 255, 1)",
              padding: 20,
              paddingLeft: 30,
              borderRadius: 0,
              fontWeight: "bold",
              textAlign: "left",
              alignSelf: "center",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            Chai?
          </Text>
          <Text
            style={{
              bottom: "29%",
              fontSize: 24,
              color: "rgba(255, 255, 255, .5)",
              padding: 20,
              paddingLeft: 30,
              borderRadius: 0,
              fontWeight: "bold",
              textAlign: "left",
              alignSelf: "center",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            So, what's on your mind?
          </Text>
          <View
            style={{
              flexDirection: "row",
              margin: 40,
              width: window.width,
              justifyContent: "center",
              ...style.inputView,
            }}
          >
            <View style={{ flex: 4 }}>
              <TextInput
                style={style.inputText}
                onChangeText={this.onChangeText}
                value={this.state.inputVal}
                placeholder="Something on your mind..."
              />
            </View>
            <View style={{ alignSelf: "flex-start", justifyContent: "center", marginTop: 4 }}>
              {this.state.loading ? (
                <View style={{ width: 30, height: 30 }}></View>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    if (this.state.inputVal.length > 0) {
                      this.setState({ loading: true }, () => this.sendMessage.call(this));
                    }
                  }}
                >
                  <Icon name="send" type="material" color={Constants.mainTextColor} size={32} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        {this.state.loading && (
          <View
            style={{
              position: "absolute",
              left: "80%",
              right: 0,
              top: 0,
              bottom: 90,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ActivityIndicator size="large" color={Constants.mainTextColor} />
          </View>
        )}
      </SafeAreaView>
    );
  }
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  mainText: {
    bottom: 0,
    borderRadius: 15,
    width: "90%",
    color: Constants.mainTextColor,
    textAlign: "left",
    fontSize: 30 / PixelRatio.getFontScale(),
    // textShadowOffset: {
    //   width: 0,
    //   height: 0,
    // },
    // textShadowColor: Constants.backgroundColor,
    // textShadowRadius: 1,
  },
  inputView: {
    margin: 20,
    bottom: "30%", //Constants.SCREEN_HEIGHT/3,
    width: "90%",
    height: 40,
  },
  inputText: {
    height: 40,
    paddingLeft: 15,
    marginRight: 30,
    fontSize: 16 / PixelRatio.getFontScale(),
    fontWeight: "normal",
    color: Constants.mainTextColor,
    backgroundColor: "#1c1c1c",
    borderRadius: 15
    // borderBottomWidth: 1,
    // borderBottomColor: "dimgray"
  },
});

export default CreateConvo;
