import React from "react";
import { View, Alert, ActivityIndicator, TouchableOpacity } from "react-native";
import { GiftedChat, Bubble, InputToolbar, Send, LoadEarlier } from "react-native-gifted-chat";
import { unionWith, reverse } from "lodash";
import { Icon } from "react-native-elements";
import ConvoController from "./../Controllers/ConvoController";
import AsyncStorage from "@react-native-community/async-storage";
import Constants from "../Constants";
import Filter from "bad-words";

class Convo extends React.Component {
  constructor(props) {
    super(props);
    this.filter = new Filter();
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

  onFocus = async () => {
    const callback = async () => {
      this.props.updateContainer(this.state.pending);
      this._isMounted = true;
      this.stopController = await this.startController();
      if (!this.state.pending && this.props.route.params.unread) {
        ConvoController.markRead(this.props.route.params.id);
      }
    };

    if (this.props.route.params.pending == null) {
      const pending = await ConvoController.isPending(this.props.route.params.id);
      this.setState({ pending }, callback);
    } else {
      this.setState({ pending: this.props.route.params.pending }, callback);
    }
  };

  onBlur = () => {
    if (!this.state.pending && this.props.route.params.unread) {
      ConvoController.markRead(this.props.route.params.id);
    }
    this._isMounted = false;
    if (this.stopController) {
      this.stopController();
    }
  };

  componentDidMount = async () => {
    if (!this.props.route.params.pending) {
      AsyncStorage.getItem(this.props.route.params.id).then((messages) => {
        if (messages != null) {
          this.setState({ messages: JSON.parse(messages) });
        }
      });
    }

    this._unsubscribeFocus = this.props.navigation.addListener("focus", async () => {
      await this.onFocus();
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

  updateCallback = (messages, pending = this.state.pending) => {
    if (this._isMounted) {
      const new_messages = unionWith(messages, this.state.messages, (a, b) => {
        return a._id == b._id;
      });

      const sorted_msgs = new_messages.sort((a, b) => {
        if (!a.createdAt) {
          return -1;
        } else if (!b.createdAt) {
          return 1;
        }

        return b.createdAt - a.createdAt;
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
        "Resolved",
        "This message has been resolved by the original user. Thanks for your help!",
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

  send = async (messages) => {
    let mapped_messages = await Promise.all(
      messages.map(async (message) => {
        const id = await ConvoController.getMessageId(this.props.route.params.id);
        return {
          _id: id,
          text: this.filter.clean(message.text),
          user: message.user,
        };
      })
    );

    mapped_messages = reverse(mapped_messages);

    this.setState({ messages: [...mapped_messages, ...this.state.messages] });
    if (this.state.pending && !this.props.route.params.user.primary) {
      await ConvoController.addUserToConvo(this.props.route.params.id);

      this.setState({ pending: false });
    }

    ConvoController.send(mapped_messages, "" + this.props.route.params.id, this.state.pending);
  };

  renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        textStyle={{
          right: {
            color: Constants.mainTextColor,
          },
          left: {
            color: Constants.mainTextColor,
          },
        }}
        wrapperStyle={{
          right: {
            backgroundColor: Constants.backgroundColor,
            borderRadius: 15,
          },
          left: {
            backgroundColor: this.props.route.params.user.primary ? Constants.accentColorOne : Constants.accentColorTwo,
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
        backgroundColor: Constants.backgroundColor,
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
        color={this.props.route.params.user.primary ? Constants.accentColorOne : Constants.accentColorTwo}
        size={32}
      />
    </Send>
  );

  renderLoadEarlier = (props) =>
    this.state.messages.length >= 20 ? (
      <TouchableOpacity
        onPress={() => {
          if (props.onLoadEarlier) {
            props.onLoadEarlier();
          }
        }}
      >
        <Icon name="refresh" type="material" color="dimgray" size={32} style={{ paddingBottom: 30 }} />
      </TouchableOpacity>
    ) : null;

  renderLoading = () => (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" color={Constants.mainTextColor}></ActivityIndicator>
    </View>
  );

  onLoadEarlier = async () => {
    const oldMsgs = await ConvoController.getMessages(
      this.state.messages[this.state.messages.length - 1].createdAt,
      this.props.route.params.id
    );
    this.updateCallback(oldMsgs);
  };

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: Constants.backgroundColor }}>
        <GiftedChat
          renderBubble={this.renderBubble}
          renderInputToolbar={this.renderInputToolbar}
          renderSend={this.renderSend}
          alwaysShowSend
          renderAvatar={null}
          textInputStyle={{
            color: Constants.mainTextColor,
            padding: 10,
            backgroundColor: "#1c1c1c",
            borderRadius: 15,
            lineHeight: 24,
          }}
          minInputToolbarHeight={53}
          messages={this.state.messages}
          onSend={this.send}
          user={{ _id: this.props.route.params.user.id, name: "Anonymous" }}
          renderLoading={this.renderLoading}
          loadEarlier={true}
          renderLoadEarlier={this.renderLoadEarlier}
          onLoadEarlier={this.onLoadEarlier}
          placeholder="Text here..."
          timeTextStyle={{ left: { color: Constants.mainTextColor },right: { color:'gray'} }}
        />
      </View>
    );
  }
}

export default Convo;
