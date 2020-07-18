import React from "react";
import Convo from "./Convo";
import { Text, View, Animated, PanResponder, SafeAreaView, StatusBar } from "react-native";
import { ScreenContainer } from "react-native-screens";
import { homeStyle } from "../index";
import ConvoCardsController from "../Controllers/ConvoCardsController";
import Constants from "./../Constants";
import { unionWith } from "lodash";

class ConvoCards extends React.Component {
  constructor(props) {
    super(props);

    this.position = new Animated.ValueXY();
    //prob need a position 2 if u want to do that. i think just leave it for later
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
      removedData: [],
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
            this.state.removedData.push(new_data.shift());
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
            this.state.removedData.push(go_to);
            this.setState({ data: new_data }, () => {
              this.position.setValue({ x: 0, y: 0 });
            });
            console.log(go_to.id)
            this.props.navigation.navigate("Convo", {
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

  async componentDidUpdate(prevProps, prevState) {
    if (this.state.data.length == 0 && this.state.numDocs < 100 && this.state.removedData.length > 0) {
      this.setState({ data: this.state.removedData }, this.setState({ removedData: [] }));
    } else if (this.state.data.length == 0 && this.state.numDocs > 0 && !this.startedConvoGet) {
      this.startedConvoGet = true;
      this.getConvos.call(this);
    }
  }

  async componentDidMount() {
    console.log("getting convos");
    this.getConvos.call(this);
    this._unsubscribeFocus = this.props.navigation.addListener("focus", () => {
      this._isMounted = true;
      ConvoCardsController.listen(this.props.route.params.user.id, (numDocs, addedDocs) => {
        if (this._isMounted) {
          this.setState({ numDocs: this.state.numDocs + numDocs });
          if(this.state.numDocs < 100)
            addedDocs.forEach((doc) => this.state.data.push(doc));
        }
      });
    });

    this._unsubscribeBlur = this.props.navigation.addListener("blur", () => {
      this.setState({ currentIndex: 0, numDocs: 0 }, () => {
        ConvoCardsController.stopListen();
        this._isMounted = false;
      });
    });
  }

  componentWillUnmount() {
    this._unsubscribeFocus();
    this._unsubscribeBlur();
  }

  async getConvos() {
    const request = await ConvoCardsController.getPendingConvos(this.props.route.params.user.id, this.prevDoc);
    this.prevDoc = request.prevDoc;
    const unioned_data = unionWith(this.state.data, request.convos, (a, b) => a.id == b.id);
    this.setState({ data: unioned_data }, () => {
      this.startedConvoGet = false;
    });
  }

  renderCards = () => {
    const style = {
      backgroundColor: "white",
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
          <Text style={{ fontSize: 25, fontWeight: "bold", color: "black", paddingHorizontal: 40 }}>
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
          <Text style={{ fontSize: 25, fontWeight: "bold", color: "black", paddingHorizontal: 40 }}>
            {this.state.data[1].question}
          </Text>
        </Animated.View>
      ) : null;

    return [second_card, first_card];
  };

  //create a list of strings with all the pending questions - use two cards and switch between them updating the strings in the list?
  //if swipe right navigate to convo, if swipe left show next question bittttt
  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
        <StatusBar backgroundColor="black" barStyle="light-content" />
        <View style={{ height: "5%" }}></View>
        <View style={{ flex: 1, justifyContent: "center", alignContent: "center" }}>{this.renderCards()}</View>
        <View style={{ height: "5%" }}></View>
      </SafeAreaView>
    );
  }
}

export default ConvoCards;
