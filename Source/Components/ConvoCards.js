import React from "react";
import {
  Text,
  View,
  Animated,
  PanResponder,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
  PixelRatio,
} from "react-native";
import ConvoController from "../Controllers/ConvoController";
import Constants from "./../Constants";
import { unionWith } from "lodash";
import LottieView from "lottie-react-native";

class ConvoCards extends React.Component {
  constructor(props) {
    super(props);

    this.position = new Animated.ValueXY();

    this.rotate = this.position.x.interpolate({
      inputRange: [-Constants.SCREEN_WIDTH / 2, 0, Constants.SCREEN_WIDTH / 2],
      outputRange: ["-10deg", "0deg", "10deg"],
      extrapolate: "clamp",
    });
    this.rotateAndTranslate = [
      {
        rotate: this.rotate,
      },
      ...this.position.getTranslateTransform(),
    ];

    this.state = {
      currentIndex: 0,
      data: [],
      numDocs: 0,
    };

    this.nextCardOpacity = this.position.x.interpolate({
      inputRange: [-Constants.SCREEN_WIDTH - 50, 0, Constants.SCREEN_WIDTH + 50],
      outputRange: [1, 0.8, 1],
      extrapolate: "clamp",
    });
    this.nextCardScale = this.position.x.interpolate({
      inputRange: [-Constants.SCREEN_WIDTH - 50, 0, Constants.SCREEN_WIDTH + 50],
      outputRange: [1, 0.8, 1],
      extrapolate: "clamp",
    });

    this.PanResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gs) => {
        Animated.event([null, { dx: this.position.x, dy: this.position.y }], {
          useNativeDriver: false,
        })(e, gs);
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < -60) {
          Animated.spring(this.position, {
            toValue: { x: -Constants.SCREEN_WIDTH - 50, y: gestureState.dy },
            restSpeedThreshold: 100,
            restDisplacementThreshold: 40,
            useNativeDriver: true,
          }).start(() => {
            const new_data = this.state.data;
            new_data.shift();
            this.setState({ data: new_data }, () => {
              this.position.setValue({ x: 0, y: 0 });
            });
          });
        } else if (gestureState.dx > 60) {
          Animated.spring(this.position, {
            toValue: { x: Constants.SCREEN_WIDTH + 50, y: gestureState.dy },
            restSpeedThreshold: 100,
            restDisplacementThreshold: 40,
            useNativeDriver: true,
          }).start(() => {
            const new_data = this.state.data;
            const go_to = new_data.shift();
            this.setState({ data: new_data }, () => {
              this.position.setValue({ x: 0, y: 0 });
            });
            this.props.navigation.navigate("ConvoContainer", {
              id: go_to.id,
              pending: true,
              user: { ...this.props.route.params.user, primary: false },
            });
          });
        } else {
          Animated.spring(this.position, {
            toValue: { x: 0, y: 0 },
            friction: 4,
            useNativeDriver: true,
          }).start();
        }
      },
    });
  }

  componentDidUpdate = async () => {
    if (this.state.data.length == 0 && this.state.numDocs > 0 && !this.startedConvoGet) {
      this.startedConvoGet = true;
      this.getConvos.call(this);
    }
    if (this.animation && this.state.numDocs == 0) {
      this.animation.play(120, 120);
    }
  };

  componentDidMount = async () => {
    this.getConvos.call(this);
    if (this.animation) {
      this.animation.play(120, 120);
    }

    this._unsubscribeFocus = this.props.navigation.addListener("focus", () => {
      // if(this.bg_animation) {
      //   this.bg_animation.play()
      // }
      this._isMounted = true;
    });

    this._unsubscribeBlur = this.props.navigation.addListener("blur", () => {
      this._isMounted = false;
    });
  };

  componentWillUnmount = () => {
    this._isMounted = false;
    this._unsubscribeFocus();
    this._unsubscribeBlur();
  };

  getConvos = async () => {
    const request = await ConvoController.getPendingConvos(this.props.route.params.user.id, this.prevDoc);
    this.prevDoc = request.prevDoc;
    const unioned_data = unionWith(this.state.data, request.convos, (a, b) => a.id == b.id);
    this.setState({ data: unioned_data, numDocs: request.convos.length }, () => {
      this.startedConvoGet = false;
    });
  };

  renderCards = () => {
    const style = {
      backgroundColor: "#1c1c1c",
      // borderWidth: 5,
      borderColor: "#1c1c1c",
      height: "100%",
      width: Constants.SCREEN_WIDTH - 40,
      marginLeft: 20,
      position: "absolute",
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    };

    const first_card =
      this.state.data.length > 0 ? (
        <Animated.View
          key={0}
          {...this.PanResponder.panHandlers}
          style={{ transform: this.rotateAndTranslate, ...style }}
        >
          <Text
            style={{
              fontSize: 24 / PixelRatio.getFontScale(),
              fontWeight: "bold",
              color: Constants.mainTextColor,
              paddingHorizontal: 40,
            }}
          >
            {this.state.data[0].question}
          </Text>
        </Animated.View>
      ) : null;

    const second_card =
      this.state.data.length > 1 ? (
        <Animated.View
          key={1}
          style={{ ...style, opacity: this.nextCardOpacity, transform: [{ scale: this.nextCardScale }] }}
        >
          <Text
            style={{
              fontSize: 24 / PixelRatio.getFontScale(),
              fontWeight: "bold",
              color: Constants.mainTextColor,
              paddingHorizontal: 40,
            }}
          >
            {this.state.data[1].question}
          </Text>
        </Animated.View>
      ) : null;

    return [second_card, first_card];
  };

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Constants.backgroundColor }}>
        <StatusBar backgroundColor={Constants.backgroundColor} barStyle="light-content" />
        <LottieView
        style={{zIndex: -1, position: "absolute", width: '100%', bottom: 0}}
          ref={(animation) => {
            this.bg_animation = animation;
          }}
          source={require("./../../resources/cardsbg.json")}
          loop={true}
        ></LottieView>
        <View style={{ height: "5%" }}></View>
        {this.state.numDocs > 0 ? (
          <View style={{ flex: 1, justifyContent: "center", alignContent: "center" }}>{this.renderCards()}</View>
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignContent: "center",
              margin: Constants.SCREEN_WIDTH / 4,
            }}
          >
            <LottieView
              ref={(animation) => {
                this.animation = animation;
              }}
              source={require("./../../resources/refresh.json")}
              loop={false}
            ></LottieView>
            <TouchableOpacity
              style={{ height: Constants.SCREEN_HEIGHT, width: Constants.SCREEN_WIDTH }}
              onPress={() => {
                this.animation.play(0, 100);
                this.getConvos();
              }}
            />
          </View>
        )}
        <View style={{ height: "5%" }}></View>
      </SafeAreaView>
    );
  }
}

export default ConvoCards;
