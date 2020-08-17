import React from "react";
import { TextInput, Text, StatusBar, Button, StyleSheet, View, Animated, SafeAreaView, PixelRatio } from "react-native";
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
    console.log(PixelRatio.getFontScale())
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
      <SafeAreaView style={style.container}>
        <StatusBar backgroundColor="black" barStyle="light-content" />

        <Text style={style.mainText}>So, what's on your mind?</Text>
        <LottieView
          style={{ marginBottom: 20 }}
          ref={(animation) => {
            this.animation = animation;
          }}
          source={require("./../../resources/tea-anim.json")}
        ></LottieView>
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
              placeholderTextColor="white"
            />
          </View>
          <View style={{ alignSelf: "flex-start", justifyContent: "center", marginTop: 4 }}>
            {this.state.loading ? (
              <View style={{ width: 30, height: 30 }}></View>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  this.setState({ loading: true }, () => this.sendMessage.call(this));
                }}
              >
                <Icon name="send" type="material" color="white" size={32} />
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
    justifyContent: "space-around",
    backgroundColor: "black",
  },
  mainText: {
    marginTop: 50,
    borderRadius: 15,
    width: "85%",
    color: "white",
    fontWeight: "normal",
    textAlign: "left",
    fontSize: 30 / PixelRatio.getFontScale(),
  },
  inputView: {
    margin: 20,
    marginBottom: Constants.SCREEN_HEIGHT / 3,
    width: "85%",
    height: 40,
  },
  inputText: {
    height: 40,
    paddingLeft: 0,
    marginRight: 30,
    fontSize: 18 / PixelRatio.getFontScale(),
    fontWeight: "normal",
    color: "white",
    borderBottomColor: "white",
    borderRadius: 15,
    // borderBottomWidth: 1,
  },
});

export default CreateConvo;
