import React from "react";
import CreateConvo from "../Components/CreateConvo";
import Convo from "../Components/Convo";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from "@react-navigation/drawer";
import { useFocusEffect } from "@react-navigation/native";
import { isArguments } from "lodash";
import PendingConvoController from "../Controllers/PendingConvoController";
import { View } from "react-native";

const Drawer = createDrawerNavigator();

function DrawerContent(props) {
  console.log("drawer" + props.primary);
  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <DrawerItem
          label="Resolve"
          onPress={() => {
            props.resolve();
          }}
        />
        {props.primary ? (
          <DrawerItem
            label="New Opinion"
            onPress={() => {
              props.getNewOpinion();
            }}
          />
        ) : null}
      </DrawerContentScrollView>
    </View>
  );
}

//pretty easy, just
class ConvoContainer extends React.Component {
  state = {
    pending: this.props.route.params.pending,
    controller: {
      deleteConvo: () => {
        console.log("AHHHH");
      },
    },
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
    console.log("resolving");
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
        screenOptions={{
          headerShown: false,
        }}
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
