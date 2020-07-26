import React from "react";
import { View, Alert } from "react-native";
import { GiftedChat, Bubble } from "react-native-gifted-chat";
import { unionWith, update } from "lodash";
import ConvoController from "./../Controllers/ConvoController";
import GestureRecognizer from "react-native-swipe-gestures";

//TODO: notifications
class Convo extends React.Component {
  constructor(props) {
    super(props);
  }

  async componentDidUpdate(prevProps, prevState) {
    if (prevState.pending != this.state.pending && this._isMounted == true) {
      if (!this.props.route.params.user.primary && this.state.pending) {
        //add a callback here to open up some kinda alert
        this.props.navigation.goBack();
        return;
      }
      await this.stopController();
      await this.startController();
      this.props.updateContainer(this.state.pending);
    }
  }

  async componentDidMount() {
    this._unsubscribeFocus = this.props.navigation.addListener("focus", async () => {
      if (this.props.route.params.pending == null) {
        console.log("null")
        const pending = await ConvoController.isPending(this.props.route.params.id);
        this.setState({ pending }, () => {
          this._isMounted = true;
          this.startController();
        });
      } else {
        console.log('we good')
        this.setState({ pending: this.props.route.params.pending }, () => {
          this._isMounted = true;
          this.startController();
        });
      }
    });

    this._unsubscribeBlur = this.props.navigation.addListener("blur", () => {
      this._isMounted = false;
      this.stopController();
    });
  }

  async stopController() {
    if (this._isMounted) {
      return ConvoController.stop("" + this.props.route.params.id);
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.stopController();
    this._unsubscribeFocus();
    this._unsubscribeBlur();
  }

  async startController() {
    let update = (messages, pending) => {
      if (this._isMounted) {
        const new_messages = unionWith(this.state.messages, messages, (a, b) => a._id == b._id);
        const sorted_msgs = new_messages.sort((a, b) => {
          return b._id - a._id;
        });
        console.log("updating");
        this.setState({ messages: sorted_msgs, pending });
      }
    };

    let alert = () => {
      Alert.alert("This conversation has been deleted by the author");
      this.props.navigation.goBack();
    };

    return ConvoController.start(
      update.bind(this),
      "" + this.props.route.params.id,
      alert.bind(this),
      this.state.pending
    );
  }

  async send(messages) {
    if (this.state.pending && !this.props.route.params.user.primary) {
      console.log("start adding user");
      await ConvoController.addUserToConvo(
        this.state.messages[0].text,
        this.props.route.params.user.id,
        this.props.route.params.id
      );
      console.log("done adding user");
      this.setState({ pending: false });
    }
    ConvoController.send(messages, "" + this.props.route.params.id, this.state.pending);
  }

  static navigationOptions = ({ navigation }) => ({
    title: (navigation.state.params || {}).name || "Chat!",
  });

  state = {
    messages: [],
    pending: false,
  };

  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#6a8fcc",
          },
        }}
      />
    );
  }

  render() {
    return (
      <GiftedChat
        renderBubble={this.renderBubble}
        messages={this.state.messages}
        onSend={this.send.bind(this)}
        user={{ _id: this.props.route.params.user.id, name: "Anonymous" }}
      />
    );
  }
}
export default Convo;
