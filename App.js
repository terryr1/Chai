import React from "react";
import Main from "./Source/Tabs/Main";
import Setup from "./Source/Components/Setup";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { decode, encode } from "base-64";
import AuthController from "./Source/Controllers/AuthController";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Animated } from "react-native";
import * as SplashScreen from 'expo-splash-screen';
import NavigationService from "./Source/NavigationService";
import Constants from "./Source/Constants";
import { Easing } from "react-native-reanimated";
import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";
import AsyncStorage from "@react-native-community/async-storage";

//fixed a random error------
if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}
// ------------------------

const Stack = createStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const linking = {
  prefixes: ["https://chailogin.page.link"],
};

class App extends React.Component {
  constructor() {
    super();
    this.MyTheme = {
      dark: true,
      colors: {
        background: "rgb(0, 0, 0)",
        border: "rgb(0, 0, 0)",
      },
    };
  }

  state = {
    user: false,
    splashAnimation: new Animated.Value(0),
    splashAnimationComplete: false,
    notification: {},
  };

  componentDidMount = async () => {
    this.onNotificationListener = Notifications.addNotificationReceivedListener(this.handleNotification);
    this.onResponseListener = Notifications.addNotificationResponseReceivedListener(this.handleResponse);
    AuthController.shared.checkForAuthentication((user) => {
      if (user) {
        this.setState({ user, isLoadingComplete: true });
      } else {
        this.setState({ user: "noUser" });
      }
    });
    const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    const granted = await AsyncStorage.getItem("notification_permission");
    if (status == "granted" && granted !== "granted" && this.state.user !== "noUser") {
      let token = await Notifications.getExpoPushTokenAsync();
      AuthController.shared.addNotificationToken(token);
      AsyncStorage.setItem("notification_permission", "granted");
    }
  };

  handleNotification = async (notification) => {
    if (notification.request.content.data.convo_id || notification.request.content.data.body.convo_id) {
      this.queuedNotification = notification.request.content.data.convo_id
        ? response.notification.request.content.data
        : notification.request.content.data.body;
      if (this.state.user) {
        NavigationService.navigate({ ...this.queuedNotification, uid: this.state.user.uid });
      }
    }
  };

  handleResponse = async (response) => {
    if (
      response.notification.request.content.data.convo_id ||
      response.notification.request.content.data.body.convo_id
    ) {
      this.queuedNotification = response.notification.request.content.data.convo_id
        ? response.notification.request.content.data
        : response.notification.request.content.data.body;
      if (this.state.user) {
        NavigationService.navigate({ ...this.queuedNotification, uid: this.state.user.uid });
      }
    }
  };

  componentWillUnmount = () => {
    Notifications.removeNotificationSubscription(this.onResponseListener);
  };

  animateOut = () => {
    SplashScreen.hideAsync();
    Animated.timing(this.state.splashAnimation, {
      toValue: 1,
      duration: 700,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      this.setState({ splashAnimationComplete: true });
    });
  };

  loadSplashAnimation = () => {
    if (this.state.splashAnimationComplete) {
      return null;
    }
    this.animateOut();
    return (
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
          backgroundColor: Constants.backgroundColor,
          opacity: this.state.splashAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0],
          }),
        }}
      ></Animated.View>
    );
  };

  render() {
    if (!this.state.user) {
      return <View style={{ width: "100%", height: "100%", backgroundColor: Constants.backgroundColor }} />;
    }

    return (
      <View style={{ flex: 1, backgroundColor: Constants.backgroundColor }}>
        <NavigationContainer
          theme={this.MyTheme}
          linking={linking}
          ref={(navigationRef) => NavigationService.setTopLevelNavigator(navigationRef)}
          onReady={() => {
            if (this.queuedNotification) {
              NavigationService.navigate({ ...this.queuedNotification, uid: this.state.user.uid });
            }
          }}
        >
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
              initialParams={{
                uid: this.state.user == "noUser" ? null : this.state.user.uid,
              }}
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
