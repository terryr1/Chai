import React from "react";
import {TextInput, Easing, Text, StatusBar, Button, StyleSheet, View, Animated } from "react-native";
import CreateConvoController from "../Controllers/CreateConvoController";
import LottieView from "lottie-react-native";
import {SafeAreaView} from "react-navigation";

class CreateConvo extends React.Component {
  state = {
    inputVal: "",
    progress: new Animated.Value(0),
    val: 0,
  };

  onChangeText = (val) => {
    this.setState({ inputVal: val });
  };

  async sendMessage() {
    const convo_id = await CreateConvoController.create(this.state.inputVal, this.props.route.params.user.id);
    this.setState({ inputVal: "", loading: false });
    this.props.navigation.navigate("ConvoContainer", {
      id: convo_id,
      pending: true,
      user: { ...this.props.route.params.user, primary: true },
    });
  }

  async componentDidMount() {
    console.log("MOUNTING");
    this._unsubscribeFocus = this.props.navigation.addListener("focus", async () => {
      console.log("focus");
      Animated.loop(
        Animated.sequence([
          Animated.timing(this.state.progress, {
            toValue: 1,
            duration: 30000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(this.state.progress, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    this._unsubscribeBlur = this.props.navigation.addListener("blur", async () => {
      console.log("blur");
      this.state.progress.stopAnimation();
    });
  }

  componentWillUnmount() {
    this._unsubscribeFocus();
    this._unsubscribeBlur();
  }

  render() {
    return (
      <SafeAreaView style={style.container}>
        <StatusBar backgroundColor="black" barStyle="light-content" />
        <LottieView
          style={{ marginBottom: 30 }}
          ref={(animation) => {
            this.animation = animation;
          }}
          source={require("./../../resources/tea-anim2.json")}
          progress={this.state.progress}
        ></LottieView>
        <Text style={style.mainText}>So, what's on{"\n"}your mind?</Text>
        <View
          style={{
            flexDirection: "row",
            margin: 40,
            width: window.width,
            alignItems: "center",
            justifyContent: "center",
            ...style.inputView,
          }}
        >
          <View style={{ flex: 4 }}>
            <TextInput
              style={style.inputText}
              onChangeText={this.onChangeText}
              value={this.state.inputVal}
              placeholder="Something on your mind"
            />
          </View>
          <View style={{ flex: 1 }}>
            {this.state.loading ? (
              <></>
            ) : (
              <Button
                onPress={() => {
                  this.setState({ loading: true }, () => this.sendMessage.call(this));
                }}
                color="black"
                col
                title="send"
              />
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
    backgroundColor: "black",
  },
  mainText: {
    padding: 40,
    marginBottom: 25,
    color: "white",
    fontWeight: "normal",
    textAlign: "center",
    fontSize: 36,
  },
  inputView: {
    margin: 40,
    marginBottom: 250,
    paddingHorizontal: 20,
    width: "80%",
    backgroundColor: "white",
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
  },
  inputText: {
    height: 50,
  },
  buttonText: {
    color: "white",
    lineHeight: 50,
  },
  button: {
    margin: 40,
    width: "80%",
    backgroundColor: "#4285F4",
    borderRadius: 25,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default CreateConvo;
