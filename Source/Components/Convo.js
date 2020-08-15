import React from "react";
import { View, Alert, ActivityIndicator } from "react-native";
import { GiftedChat, Bubble, InputToolbar, Send } from "react-native-gifted-chat";
import { unionWith } from "lodash";
import { Icon } from "react-native-elements";
import ConvoController from "./../Controllers/ConvoController";
import AsyncStorage from "@react-native-community/async-storage";

//TODO: notifications
//dismiss notifications when open convo - notifications should have the question (messages[0])
class Convo extends React.Component {
  constructor(props) {
    super(props);
  }

  state = {
    messages: [],
    pending: false,
  };

  componentDidUpdate = async (prevProps, prevState) => {
    if (prevState.pending != this.state.pending && this._isMounted == true) {
      this.stopController();
      this.stopController = await this.startController();
      this.props.updateContainer(this.state.pending);
    }
  };

  setPendingState = async () => {
    if (this.props.route.params.pending == null) {
      const pending = await ConvoController.isPending(this.props.route.params.id);
      this.setState({ pending }, async () => {
        this._isMounted = true;
        this.stopController = await this.startController();
      });
    } else {
      this.setState({ pending: this.props.route.params.pending }, async () => {
        this._isMounted = true;
        this.stopController = await this.startController();
      });
    }
  };

  onBlur = () => {
    this._isMounted = false;
    if (this.stopController) {
      this.stopController();
    }
  };

  componentDidMount = async () => {
    AsyncStorage.getItem(this.props.route.params.id).then((messages) => {
      if (messages != null) {
        this.setState({ messages: JSON.parse(messages) });
      }
    });

    this._unsubscribeFocus = this.props.navigation.addListener("focus", async () => {
      await this.setPendingState();
    });

    this._unsubscribeBlur = this.props.navigation.addListener("blur", () => {
      this.onBlur();
    });
  };

  componentWillUnmount = () => {
    this.onBlur();

    this._unsubscribeFocus();
    this._unsubscribeBlur();
  };

  updateCallback = (messages, pending) => {
    if (this._isMounted) {
      const new_messages = unionWith(this.state.messages, messages, (a, b) => a._id == b._id);
      const sorted_msgs = new_messages.sort((a, b) => {
        return b._id - a._id;
      });

      if (!this.state.pending || this.props.route.params.user.primary) {
        AsyncStorage.setItem(this.props.route.params.id, JSON.stringify(sorted_msgs));
      }

      this.setState({ messages: sorted_msgs, pending });
    }
  };

  alertCallback = () => {
    if (!this.props.route.params.user.primary && this._isMounted) {
      this.stopController();
      Alert.alert(
        "This message has been resolved by the original user. Thanks for your help!",
        "",
        [{ text: "OK", onPress: () => this.props.navigation.goBack() }],
        { cancelable: false }
      );
    }
  };

  startController = async () => {
    return ConvoController.start(
      this.updateCallback,
      "" + this.props.route.params.id,
      this.alertCallback,
      this.state.pending
    );
  };

  //make this look like its happending fast by updating the chat before the call gets put out, then check if there's another message with the same text and user made within the last 10 seconds
  //or send the timestamp, not a big deal and makes code less complex
  send = async (messages) => {
    if (this.state.pending && !this.props.route.params.user.primary) {
      await ConvoController.addUserToConvo(
        this.state.messages[0].text,
        this.props.route.params.user.id,
        this.props.route.params.id
      );

      this.setState({ pending: false });
    }
    ConvoController.send(messages, "" + this.props.route.params.id, this.state.pending);
  };

  renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        textStyle={{
          right: {
            color: "white",
          },
          left: {
            color: "black",
          },
        }}
        wrapperStyle={{
          right: {
            backgroundColor: this.props.route.params.user.primary ? "#4285F4" : "#E65858",
            borderRadius: 15,
          },
          left: {
            backgroundColor: "white",
            borderRadius: 15,
          },
        }}
      />
    );
  };

  renderInputToolbar = (props) => (
    <InputToolbar
      {...props}
      containerStyle={{
        backgroundColor: "black",
        borderTopWidth: 0,
        paddingTop: 15,
      }}
    ></InputToolbar>
  );

  renderSend = (props) => (
    <Send
      {...props}
      containerStyle={{
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 25,
        marginRight: 15,
      }}
    >
      <Icon
        name="send"
        type="material"
        color={this.props.route.params.user.primary ? "#4285F4" : "#E65858"}
        size={30}
      />
    </Send>
  );

  renderLoading = () => (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator
        size="large"
        color={this.props.route.params.user.primary ? "#4285F4" : "#E65858"}
      ></ActivityIndicator>
    </View>
  );

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: "black" }}>
        <GiftedChat
          renderBubble={this.renderBubble}
          renderInputToolbar={this.renderInputToolbar}
          renderSend={this.renderSend}
          alwaysShowSend
          renderAvatar={() => null}
          textInputStyle={{ color: "#fff", padding: 10, backgroundColor: "#1c1c1c", borderRadius: 15, lineHeight: 20 }}
          scrollToBottom
          minInputToolbarHeight={53}
          messages={this.state.messages}
          onSend={this.send}
          user={{ _id: this.props.route.params.user.id, name: "Anonymous" }}
          renderLoading={this.renderLoading}
        />
      </View>
    );
  }
}

export default Convo;
