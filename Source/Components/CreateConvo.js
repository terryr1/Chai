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
  Modal,
  TouchableOpacity,
  Alert,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import CreateConvoController from "../Controllers/CreateConvoController";
import LottieView from "lottie-react-native";
import Constants from "./../Constants";
import { Icon } from "react-native-elements";
import { getNotificationCategoriesAsync } from "expo-notifications";

class CreateConvo extends React.Component {
  state = {
    inputVal: "",
    progress: new Animated.Value(0),
    val: 0,
    showModal: false,
  };

  onChangeText = (val) => {
    this.setState({ inputVal: val });
  };

  sendMessage = async () => {
    CreateConvoController.create(this.state.inputVal, this.state.category)
      .then((response) => {
        console.log(response);
        const convo_id = response.data;
        if (convo_id) {
          this.props.navigation.navigate("ConvoContainer", {
            id: convo_id,
            pending: true,
            user: { ...this.props.route.params.user, primary: true },
            clearNotifications: this.props.route.params.clearNotifications,
          });
        }
        this.setState({ inputVal: "", loading: false, category: null });
      })
      .catch((err) => {
        console.log("error");
        setTimeout(() => Alert.alert("Oh no", err.message), 500);
        this.setState({ inputVal: "", loading: false, category: null });
      });
  };

  getCategoryPrompt = (category) => {
    return (
      <TouchableOpacity
        key={category}
        style={{ ...style.openButton, backgroundColor: "rgba(0,0,0,0)" }}
        onPress={() => {
          this.setState({ showModal: false, category }, () => this.sendMessage.call(this));
        }}
      >
        <Text style={style.textStyle}>{category}</Text>
      </TouchableOpacity>
    );
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView style={{ flex: 1 }}>
          <StatusBar backgroundColor={Constants.backgroundColor} barStyle="light-content" />
          <LottieView
            style={{
              bottom: Platform.OS === "android" ? "-15%" : 0,
              top: Platform.OS === "android" ? 0 : "2.5%",
              position: "absolute",
              width: Platform.OS === "android" ? "95%" : "100%",
              left: Platform.OS === "android" ? "2.5%" : 0,
            }}
            ref={(animation) => {
              this.teaAnimation = animation;
            }}
            source={require("./../../resources/teacup.json")}
            speed={0.25}
          ></LottieView>
          <Text
            style={{
              fontSize: 55,
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
              position: "absolute",
              top: "50%",
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
                placeholder="What you want to talk about..."
                placeholderTextColor="white"
                maxLength={200}
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
                      this.setState({ loading: true, showModal: true }); //, () => this.sendMessage.call(this));
                    }
                  }}
                >
                  <Icon name="send" type="material" color={Constants.mainTextColor} size={32} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.showModal}
            onRequestClose={() => {
              this.setState({ showModal: false, loading: false });
            }}
          >
            <View style={style.centeredView}>
              <View style={style.modalView}>
                <TouchableOpacity
                  style={{ position: "absolute", left: -12, top: -15 }}
                  onPress={() => this.setState({ showModal: false, loading: false })}
                >
                  <Icon
                    name="highlight-off"
                    type="material"
                    color="gray"
                    size={40}
                    borderRadius={20}
                    backgroundColor="black"
                  />
                </TouchableOpacity>
                <Text style={style.modalText}>What describes this conversation best?</Text>
                {Constants.categories.map((category) => {
                  return this.getCategoryPrompt(category);
                })}
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </TouchableWithoutFeedback>
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
    paddingLeft: 10,
    paddingRight: 10,
    marginRight: 30,
    fontSize: 16 / PixelRatio.getFontScale(),
    fontWeight: "normal",
    color: Constants.mainTextColor,
    backgroundColor: "#1c1c1c",
    borderRadius: 15,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: Constants.backgroundColor,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "gray",
    padding: 35,
    alignItems: "flex-end",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  openButton: {
    backgroundColor: "rgba(0,0,0,0)",
    borderRadius: 20,
    padding: 10,
  },
  textStyle: {
    color: Constants.mainTextColor,
    textAlign: "right",
  },
  modalText: {
    marginBottom: 15,
    fontSize: 20,
    textAlign: "left",
    color: Constants.mainTextColor,
    fontWeight: "bold",
  },
});

export default CreateConvo;
