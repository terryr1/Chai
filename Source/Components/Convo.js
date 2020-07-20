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
    if (prevState.pending != this.state.pending) {
      await this.stopController();
      await this.startController();
      this.props.updateContainer(this.state.pending);
    }
  }

  componentDidMount() {
    this._unsubscribeFocus = this.props.navigation.addListener("focus", () => {
      this.setState({ pending: this.props.pending }, () => {
        this._isMounted = true;
        this.startController();
      });
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
      //add new user using the controller
      console.log("ADDING NEW USER")
      await ConvoController.addUserToConvo(this.state.messages[0].text, this.props.route.params.user.id, this.props.route.params.id);
      this.setState({pending: false})
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
