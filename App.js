import React from "react";
import Main from "./Source/Tabs/Main";
import Setup from "./Source/Components/Setup";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { decode, encode } from "base-64";
import AuthController from "./Source/Controllers/AuthController";
import { View, Animated } from "react-native";
import { SplashScreen } from "expo";
import { Asset } from "expo-asset";
import Constants from "./Source/Constants";
import { Easing } from "react-native-reanimated";

//fixed a random error------
if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}
// ------------------------

const Stack = createStackNavigator();

class App extends React.Component {
  constructor() {
    super();
    this.MyTheme = {
      dark: true,
      colors: {
        primary: "rgb(255, 255, 255)",
        background: "rgb(0, 0, 0)",
        card: "rgb(64, 64, 64)",
        text: "rgb(255, 255, 255)",
        border: "rgb(0, 0, 0)",
      },
    };
  }

  state = {
    user: false,
    splashAnimation: new Animated.Value(0),
    splashAnimationComplete: false,
  };

  componentDidMount = async () => {
    SplashScreen.preventAutoHide();
    //maybe try await this
    await this.loadAsync();
    AuthController.shared.checkForAuthentication((user) => {
      if (user) {
        this.setState({ user });
      } else {
        this.setState({ user: "noUser" });
      }
    });
  };

  animateOut = () => {
    SplashScreen.hide();
    Animated.timing(this.state.splashAnimation, {
      toValue: 2,
      duration: 700,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      this.setState({ splashAnimationComplete: true });
    });
  };

  loadAsync = async () => {
    try {
      await this.loadResourcesAsync();
    } catch (e) {
      this.handleLoadingError(e);
    } finally {
      this.handleFinishLoading();
    }
  };

  loadResourcesAsync = async () => {
    return Promise.all([Asset.loadAsync([require("./assets/splashscreen.png")])]);
  };

  handleLoadingError = (error) => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };

  loadSplashAnimation = () => {
    return this.state.splashAnimationComplete ? null : (
      <Animated.View
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "black",
          opacity: this.state.splashAnimation.interpolate({
            inputRange: [1, 2],
            outputRange: [1, 0],
          }),
        }}
      >
        <Animated.Image
          source={require("./assets/splashscreen.png")}
          style={{
            width: undefined,
            height: undefined,
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            resizeMode: "contain",
            transform: [
              {
                translateY: this.state.splashAnimation.interpolate({
                  inputRange: [0, 0.5],
                  outputRange: [0, Constants.SCREEN_HEIGHT * 0.05],
                }),
              },
            ],
          }}
          onLoadEnd={this.animateOut}
        />
      </Animated.View>
    );
  };

  render() {
    if (!this.state.isLoadingComplete || !this.state.user) {
      return <View style={{ width: "100%", height: "100%", backgroundColor: "black" }} />;
    }

    return (
      <View style={{ flex: 1, backgroundColor: "black" }}>
        <NavigationContainer theme={this.MyTheme}>
          <Stack.Navigator
            initialRouteName={this.state.user == "noUser" ? "Setup" : "Main"}
            screenOptions={{
              headerShown: false,
              animationEnabled: true,
            }}
          >
            <Stack.Screen
              name="Main"
              component={Main}
              initialParams={{ uid: this.state.user == "noUser" ? null : this.state.user.uid }}
            />
            <Stack.Screen name="Setup" component={Setup} />
          </Stack.Navigator>
        </NavigationContainer>
        {this.loadSplashAnimation()}
      </View>
    );
  }
}

export default App;
