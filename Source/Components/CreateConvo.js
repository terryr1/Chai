import React from "react";
import { SafeAreaView, TextInput, Text, StatusBar, Button, StyleSheet, View } from "react-native";
import CreateConvoController from "../Controllers/CreateConvoController";

class CreateConvo extends React.Component {
  state = {
    inputVal: "",
  };

  onChangeText = (val) => {
    this.setState({ inputVal: val });
  };

  async sendMessage() {
    const convo_id = await CreateConvoController.create(this.state.inputVal, this.props.route.params.user.id);
    this.setState({ inputVal: "" });
    this.props.navigation.navigate("ConvoContainer", {
      id: convo_id,
      pending: true,
      user: { ...this.props.route.params.user, primary: true },
    });
  }

  render() {
    return (
      <SafeAreaView style={style.container}>
        <StatusBar backgroundColor="black" barStyle="light-content" />
        <Text style={style.mainText}>So what's on your mind?</Text>
        <View
          style={{
            flexDirection: "row",
            margin: 40,
            width: window.width,
            alignItems: "center",
            justifyContent: "center",
            ...style.inputView,
          }}
        >
          <View style={{ flex: 4 }}>
            <TextInput
              style={style.inputText}
              onChangeText={this.onChangeText}
              value={this.state.inputVal}
              placeholder="Something on your mind"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button onPress={this.sendMessage.bind(this)} color="black" col title="send" />
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "black",
  },
  mainText: {
    padding: 40,
    color: "white",
    fontSize: 30,
  },
  inputView: {
    margin: 40,
    paddingHorizontal: 20,
    width: "80%",
    backgroundColor: "white",
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
  },
  inputText: {
    height: 50,
  },
  buttonText: {
    color: "white",
    lineHeight: 50,
  },
  button: {
    margin: 40,
    width: "80%",
    backgroundColor: "#4285F4",
    borderRadius: 25,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default CreateConvo;
