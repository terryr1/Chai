import React from "react";
import Convo from "../Components/Convo";
import ConvoController from "../Controllers/ConvoController";
import { Animated, View, StyleSheet, TouchableOpacity, Text, ScrollView } from "react-native";
import SideMenu from "react-native-side-menu";
import Constants from "../Constants";
import MessageListController from "../Controllers/MessageListController";

function DrawerContent(props) {
  return (
    <ScrollView
      scrollsToTop={false}
      style={{ flex: 1, width: window.width, height: window.height, backgroundColor: "#1c1c1c", padding: 20 }}
    >
      <View style={style.container}>
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
        <TouchableOpacity
          style={style.button}
          onPress={() => {
            props.report();
          }}
        >
          <Text style={style.buttonText}>REPORT</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1c1c1c",
  },
  buttonText: {
    color: "white",
    lineHeight: 50,
  },
  button: {
    margin: 40,
    width: "80%",
    backgroundColor: "#6a8fcc",
    borderRadius: 25,
    height: 50,
    alignItems: "center",
  },
});

//pretty easy, just
class ConvoContainer extends React.Component {
  state = {
    pending: "not set",
    isOpen: false,
  };

  componentDidMount = async () => {};

  updateContainer = (pending) => {
    this.setState({ pending });
  };

  getNewOpinion = async () => {
    if (!this.state.pending) {
      await ConvoController.resetConvo(this.props.route.params.id);
    } else {
      //notify new user
    }

    console.log("replacing");
    this.props.navigation.replace("ConvoContainer", {
      id: this.props.route.params.id,
      user: this.props.route.params.user,
      pending: true,
    });
  };

  updateMenuState(isOpen) {
    this.setState({ isOpen });
  }

  //needs to only remove the convo from the user if not primary
  resolve = async () => {
    this.props.route.params.user.primary
      ? await ConvoController.deleteConvo(
          this.props.route.params.user.id,
          this.props.route.params.id,
          this.state.pending
        )
      : await MessageListController.removeConvo(this.props.route.params.id);
    this.props.navigation.goBack(); //go back twice
  };

  report = async () => {
    await ConvoController.report(this.props.route.params.id);
    if (!this.state.pending) {
      console.log("resetting");
      this.props.route.params.user.primary
        ? await ConvoController.resetConvo(this.props.route.params.id)
        : await MessageListController.removeConvo(this.props.route.params.id);
    }
    this.props.navigation.goBack();
  };

  // only show new opinion if primary user
  render() {
    //drawerContent={(props) => <CustomDrawerContent {...props} />}
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
        <View style={{ flex: 1, backgroundColor: "black" }}>
          <Convo {...{ ...this.props, updateContainer: this.updateContainer.bind(this) }} />
        </View>
      </SideMenu>
    );
  }
}
//<Convo style={{backgroundColor:'black'}} {...{ ...this.props, updateContainer: this.updateContainer.bind(this) }} />
export default ConvoContainer;
