import React from "react";
import CreateConvo from "../Components/CreateConvo";
import Convo from "../Components/Convo";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from "@react-navigation/drawer";
import { useFocusEffect } from "@react-navigation/native";
import { isArguments } from "lodash";
import PendingConvoController from "../Controllers/PendingConvoController";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";

const Drawer = createDrawerNavigator();

function DrawerContent(props) {
  return (
    <View style={style.container}>
        <TouchableOpacity style={style.button} onPress={() => props.resolve()}>
          <Text style={style.buttonText}>RESOLVE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={style.button} onPress={() => props.getNewOpinion()}>
          <Text style={style.buttonText}>GET NEW OPINION</Text>
        </TouchableOpacity>
        <TouchableOpacity style={style.button} onPress={() => props.getNewOpinion()}>
          <Text style={style.buttonText}>REPORT</Text>
        </TouchableOpacity>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "black",
  },
  buttonText: {
    color: "white",
    lineHeight: 50
  },
  button: {
    margin: 40,
    width: "80%",
    backgroundColor: "#4285F4",
    borderRadius: 25,
    height: 50,
    alignItems: "center"
  },
});


//pretty easy, just
class ConvoContainer extends React.Component {
  state = {
    pending: this.props.route.params.pending,
    controller: null
  };

  updateContainer = (pending, controller) => {
    this.setState({ pending, controller });
  };

  getNewOpinion = async () => {
    if (!this.state.pending) {
      PendingConvoController.switchPendingStateToThis(this.props.route.params.user.id, this.props.route.params.id);
    } else {
      //notify new user
    }

    this.props.navigation.replace("ConvoContainer", {
      id: this.props.route.params.id,
      user: this.props.route.params.user,
      pending: true,
    });
  };

  //needs to only remove the convo from the user if not primary
  resolve = () => {
    this.state.controller.deleteConvo(
      this.props.route.params.user.id,
      this.props.route.params.id,
      this.props.route.params.user.primary
    );
    this.props.navigation.goBack(); //go back twice
  };

  // only show new opinion if primary user
  render() {
    //drawerContent={(props) => <CustomDrawerContent {...props} />}
    return (
      <Drawer.Navigator
        initialRouteName="Convo"
        drawerPosition='right'
        drawerType='slide'
        edgeWidth={1000}
        screenOptions={{
          headerShown: false,
        }}
        drawerStyle = {{width: '100%'}}
        drawerContent={(props) => (
          <DrawerContent
            {...props}
            primary={this.props.route.params.user.primary}
            resolve={this.resolve.bind(this)}
            getNewOpinion={this.getNewOpinion.bind(this)}
          />
        )}
      >
        <Drawer.Screen
          name="Convo"
          component={Convo}
          initialParams={{
            ...this.props.route.params,
            updateContainer: this.updateContainer.bind(this),
          }}
        />
      </Drawer.Navigator>
    );
  }
}

export default ConvoContainer;