import React from "react";
import Convo from "../Components/Convo";
import ConvoController from "../Controllers/ConvoController";
import {
  Animated,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import SideMenu from "react-native-side-menu";
import Constants from "../Constants";
import MessageListController from "../Controllers/MessageListController";
import { Icon } from "react-native-elements";
import AsyncStorage from "@react-native-community/async-storage";

function DrawerContent(props) {
  const style = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Constants.backgroundColor,
    },
    buttonText: {
      color: "white",
      lineHeight: 50,
    },
    button: {
      margin: 40,
      width: "80%",
      borderRadius: 15,
      backgroundColor: props.primary ? Constants.accentColorOne : Constants.accentColorTwo,
      height: 50,
      alignItems: "center",
    },
  });

  return (
    <ScrollView
      scrollsToTop={false}
      style={{
        flex: 1,
        width: window.width,
        height: window.height,
        backgroundColor: Constants.backgroundColor,
        padding: 20,
      }}
    >
      <SafeAreaView style={style.container}>
        {props.pending && !props.primary ? null : (
          <TouchableOpacity style={style.button} onPress={() => props.resolve()}>
            <Text style={style.buttonText}>RESOLVE</Text>
          </TouchableOpacity>
        )}
        {props.primary ? (
          <TouchableOpacity style={style.button} onPress={() => props.getNewOpinion()}>
            <Text style={style.buttonText}>GET NEW OPINION</Text>
          </TouchableOpacity>
        ) : null}
        {props.primary && props.pending ? null : (
          <TouchableOpacity
            style={style.button}
            onPress={() => {
              props.report();
            }}
          >
            <Text style={style.buttonText}>REPORT</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </ScrollView>
  );
}

class ConvoContainer extends React.Component {
  state = {
    pending: "not set",
    isOpen: false,
    loading: false,
  };

  updateContainer = (pending) => {
    console.log("set pending");
    console.log(pending);
    this.setState({ pending });
  };

  getNewOpinion = async () => {
    !this.state.loading &&
      this.setState({ loading: true }, async () => {
        if (!this.state.pending) {
          await AsyncStorage.removeItem(this.props.route.params.id);
          await ConvoController.resetConvo(this.props.route.params.id);
        } else {
          //either way notify new user
        }

        this._isMounted &&
          this.props.navigation.replace("ConvoContainer", {
            id: this.props.route.params.id,
            user: this.props.route.params.user,
            pending: true,
          });
      });
  };

  updateMenuState = (isOpen) => {
    this.setState({ isOpen });
  };

  resolve = async () => {
    !this.state.loading &&
      this.setState({ loading: true }, async () => {
        this.props.route.params.user.primary
          ? await ConvoController.deleteConvo(
              this.props.route.params.user.id,
              this.props.route.params.id,
              this.state.pending
            )
          : await MessageListController.removeConvo(this.props.route.params.id);
        await AsyncStorage.removeItem(this.props.route.params.id);
        this._isMounted && this.props.navigation.goBack();
      });
  };

  report = async () => {
    !this.state.loading &&
      this.setState({ loading: true }, async () => {
        await ConvoController.report(this.props.route.params.id);
        if (!this.state.pending) {
          this.props.route.params.user.primary
            ? await ConvoController.resetConvo(this.props.route.params.id)
            : await MessageListController.removeConvo(this.props.route.params.id);
        }
        await AsyncStorage.removeItem(this.props.route.params.id);
        this._isMounted && this.props.navigation.goBack();
      });
  };

  componentDidMount = async () => {
    this._unsubscribeFocus = this.props.navigation.addListener("focus", async () => {
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

  render() {
    const menu = (
      <DrawerContent
        primary={this.props.route.params.user.primary}
        pending={this.state.pending}
        resolve={this.resolve.bind(this)}
        getNewOpinion={this.getNewOpinion.bind(this)}
        report={this.report.bind(this)}
      />
    );

    return (
      <>
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
          edgeHitWidth={Constants.SCREEN_WIDTH}
          isOpen={this.state.isOpen}
          onChange={(isOpen) => this.updateMenuState(isOpen)}
        >
          <SafeAreaView style={{ flex: 1, marginBottom: 15, backgroundColor: Constants.backgroundColor }}>
            <View style={{ width: "100%", height: 60, flexDirection: "row", justifyContent: "space-between" }}>
              <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                <Icon
                  style={{ marginLeft: 20, marginTop: 10 }}
                  name="arrow-back"
                  type="material"
                  color="dimgray"
                  size={35}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.updateMenuState(true)}>
                <Icon
                  style={{ marginRight: 20, marginTop: 10 }}
                  name="menu"
                  type="material"
                  color="dimgray"
                  size={35}
                />
              </TouchableOpacity>
            </View>
            <Convo {...{ ...this.props, updateContainer: this.updateContainer.bind(this) }} />
          </SafeAreaView>
        </SideMenu>
        {this.state.loading && (
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ActivityIndicator
              size="large"
              color={this.props.route.params.user.primary ? Constants.accentColorTwo : Constants.accentColorOne}
            />
          </View>
        )}
      </>
    );
  }
}

export default ConvoContainer;
