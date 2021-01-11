import React from "react";
import {
  Text,
  View,
  Animated,
  PanResponder,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  PixelRatio,
  Platform,
  ScrollView,
} from "react-native";
import SideMenu from "react-native-side-menu";
import ConvoController from "../Controllers/ConvoController";
import { Icon } from "react-native-elements";
import Constants from "./../Constants";
import { unionWith, isEqual } from "lodash";
import LottieView from "lottie-react-native";

function DrawerContent(props) {
  const style = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: "column",
      backgroundColor: Constants.backgroundColor,
    },
    buttonSectionText: {
      color: Constants.mainTextColor,
      fontSize: 22,
      lineHeight: 50,
    },
    buttonText: {
      color: "gray",
      fontSize: 20,
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

  const button = (label, updateFunction) => {
    return (
      <TouchableOpacity
        style={style.button}
        onPress={async () => {
          updateFunction(label);
        }}
        key={label}
      >
        <Text
          style={{
            ...style.buttonText,
            color: props.setFilters.includes(label) || props.setLanguages == label ? Constants.accentColorTwo : "gray",
          }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 50 }}
      scrollsToTop={false}
      style={{
        width: window.width,
        height: "5%",
        backgroundColor: Constants.backgroundColor,
        paddingHorizontal: 20,
        paddingTop: Platform.OS === "android" ? "5%" : "15%",
      }}
    >
      <SafeAreaView style={style.container}>
        <View style={style.button}>
          <Text style={style.buttonSectionText}>LANGUAGES</Text>
        </View>
        {Constants.languages.map((language) => button(language, props.updateLanguage))}
        <View style={style.button}>
          <Text style={style.buttonSectionText}>CATEGORIES</Text>
        </View>
        {Constants.categories.map((category) => button(category, props.updateFilterState))}
      </SafeAreaView>
    </ScrollView>
  );
}

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
      setFilters: [],
      setLanguages: null,
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
              clearNotifications: this.props.route.params.clearNotifications,
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

  componentDidUpdate = async (prevProps, prevState) => {
    if (this.state.data.length == 0 && this.state.numDocs > 0 && !this.startedConvoGet) {
      this.startedConvoGet = true;
      this.getConvos();
    }
    if (this.animation && this.state.numDocs == 0) {
      this.animation.play(120, 120);
    }
    if (!isEqual(prevState.setFilters, this.state.setFilters) || prevState.setLanguages !== this.state.setLanguages) {
      this.setState({ data: [] });
    }
  };

  componentDidMount = async () => {
    this.getConvos.call(this);
    if (this.animation) {
      this.animation.play(120, 120);
    }

    // if (this.bg_animation) {
    //   this.bg_animation.play(450, 450);
    // }

    this._unsubscribeFocus = this.props.navigation.addListener("focus", () => {
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
    const request = await ConvoController.getPendingConvos(this.props.route.params.user.id, this.prevDoc, {
      categories: this.state.setFilters,
      languages: this.state.setLanguages,
    });
    this.prevDoc = request.prevDoc;
    const unioned_data = unionWith(this.state.data, request.convos, (a, b) => a.id == b.id);
    this.setState({ data: unioned_data, numDocs: request.convos.length }, () => {
      this.startedConvoGet = false;
    });
  };

  renderCards = () => {
    const style = {
      backgroundColor: Constants.accentColorTwo,
      borderWidth: 0,
      borderColor: Constants.mainTextColor,
      height: "100%",
      width: Constants.SCREEN_WIDTH - 54,
      bottom: 0,
      marginLeft: 27,
      position: "absolute",
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
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
              fontWeight: "normal",
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
              fontWeight: "normal",
              color: Constants.mainTextColor,
              paddingHorizontal: 40,
            }}
          >
            {this.state.data[1].question}
          </Text>
        </Animated.View>
      ) : null;

    const third_card =
      this.state.data.length > 1 ? (
        <Animated.View
          key={2}
          style={{ ...style, backgroundColor: "black", transform: [{ scale: this.nextCardScale }] }}
        ></Animated.View>
      ) : null;

    return [third_card, second_card, first_card];
  };

  updateMenuState = (isOpen) => {
    this.setState({ isOpen });
  };

  updateFilterState = (filter) => {
    this.state.setFilters.includes(filter)
      ? this.setState({ setFilters: this.state.setFilters.filter((ogFilter) => ogFilter !== filter) })
      : this.setState({ setFilters: [...this.state.setFilters, filter] });
  };

  updateLanguage = (language) => {
    this.state.setLanguages == language
      ? this.setState({ setLanguages: null })
      : this.setState({ setLanguages: language });
  };

  render() {
    const menu = (
      <DrawerContent
        updateFilterState={this.updateFilterState}
        updateLanguage={this.updateLanguage}
        setFilters={this.state.setFilters}
        setLanguages={this.state.setLanguages}
      />
    );

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
        edgeHitWidth={0}
        isOpen={this.state.isOpen}
        onChange={(isOpen) => this.updateMenuState(isOpen)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: Constants.backgroundColor }}>
          <StatusBar backgroundColor={Constants.backgroundColor} barStyle="light-content" />
          <View
            style={{
              height: "17%",
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-between",
              backgroundColor: Constants.backgroundColor,
              paddingVertical: 20,
            }}
          >
            <Text
              style={{ color: "white", fontSize: 30, marginLeft: 27, fontWeight: "bold", width: "60%" }}
              numberOfLines={1}
            >
              {this.state.data.length > 0 ? this.state.data[0].category : "Tap to refresh"}
            </Text>
            <TouchableOpacity onPress={() => this.updateMenuState(true)}>
              <Icon
                style={{ marginRight: 27, marginTop: 0 }}
                name="filter-list"
                type="material"
                color={this.state.setFilters.length > 0 || this.state.setLanguages !== null ? Constants.accentColorTwo : Constants.mainTextColor}
                size={35}
              />
            </TouchableOpacity>
          </View>
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
                style={{ height: "100%", width: "100%" }}
                onPress={() => {
                  this.animation.play(0, 100);
                  this.getConvos();
                }}
              />
            </View>
          )}
          <View style={{ height: Platform.OS === "android" ? "5%" : "7%" }}></View>
        </SafeAreaView>
      </SideMenu>
    );
  }
}

export default ConvoCards;
