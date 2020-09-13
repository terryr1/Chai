import React from "react";
import {
  TextInput,
  StatusBar,
  StyleSheet,
  View,
  Animated,
  SafeAreaView,
  PixelRatio,
  ActivityIndicator,
  Text,
  Platform,
} from "react-native";
import CreateConvoController from "../Controllers/CreateConvoController";
import LottieView from "lottie-react-native";
import Constants from "./../Constants";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Icon } from "react-native-elements";

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
      if (this.teaAnimation) {
        this.teaAnimation.play();
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
          source={require("./../../resources/tea-anim.json")}
          speed={0.75}
        ></LottieView>
        <LottieView
          style={{ bottom: Platform.OS === 'android' ? -60 : 0, top: Platform.OS === 'android' ? 0 : "2.5%", position: "absolute", width: Platform.OS === 'android' ? "95%" : "100%", left: Platform.OS === 'android' ?  "2.5%" : 0 }}
          ref={(animation) => {
            this.teaAnimation = animation;
          }}
          source={require("./../../resources/teacup.json")}
          speed={0.75}
        ></LottieView>
        <Text
          style={{
            fontSize: 45,
            color: "rgba(255, 255, 255, 1)",
            padding: 20,
            paddingLeft: 27,
            fontWeight: "bold",
            textAlign: "left",
            width: "100%",
          }}
        >
          Chai
        </Text>
        <Text
          style={{
            fontSize: 25,
            color: "rgba(255, 255, 255, .5)",
            bottom: 20,
            paddingLeft: 27,
            fontWeight: "bold",
            textAlign: "left",
            width: "100%",
          }}
        >
          So, what's on your mind?
        </Text>
        <View
          style={{
            top: "35%",
            flexDirection: "row",
            width: window.width,
            ...style.inputView,
          }}
        >
          <View style={{ flex: 4 }}>
            <TextInput
              style={style.inputText}
              onChangeText={this.onChangeText}
              value={this.state.inputVal}
              placeholder="Something on your mind..."
              placeholderTextColor="white"
            />
          </View>
          <View style={{ alignSelf: "flex-start", justifyContent: "center", marginTop: 2 }}>
            {this.state.loading ? (
              <View
                style={{
                  width: 30,
                  height: 30,
                }}
              >
                <ActivityIndicator size="large" color={Constants.mainTextColor} />
              </View>
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
  },
  inputView: {
    marginLeft: 20,
    width: "90%",
    height: 40,
  },
  inputText: {
    height: 40,
    paddingLeft: 7,
    marginRight: 30,
    fontSize: 16 / PixelRatio.getFontScale(),
    fontWeight: "normal",
    color: Constants.mainTextColor,
    borderRadius: 15,
  },
});

export default CreateConvo;
