import React from "react";
import { View, Alert } from "react-native";
import { GiftedChat, Bubble } from "react-native-gifted-chat";
import { unionWith, update } from "lodash";
import ConvoController from "./../Controllers/ConvoController";

//TODO: notifications
class Convo extends React.Component {
  constructor(props) {
    super(props);
  }

  async componentDidUpdate(prevProps, prevState) {
    if (prevState.pending != this.state.pending && this._isMounted == true) {
      this.stopController();
      this.stopController = await this.startController();
      this.props.updateContainer(this.state.pending);
    }
  }

  async componentDidMount() {
    this._unsubscribeFocus = this.props.navigation.addListener("focus", async () => {
      if (this.props.route.params.pending == null) {
        console.log("null");
        const pending = await ConvoController.isPending(this.props.route.params.id);
        this.setState({ pending }, async () => {
          this._isMounted = true;
          this.stopController = await this.startController();
        });
      } else {
        console.log("we good");
        this.setState({ pending: this.props.route.params.pending }, async () => {
          this._isMounted = true;
          this.stopController = await this.startController();
        });
      }
    });

    this._unsubscribeBlur = this.props.navigation.addListener("blur", () => {
      this._isMounted = false;
      this.stopController();
    });
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

    return ConvoController.start(
      update.bind(this),
      "" + this.props.route.params.id,
      alert.bind(this),
      this.state.pending
    );
  }

  //make this look like its happending fast by updating the chat before the call gets put out, then check if there's another message with the same text and user made within the last 10 seconds
  //or send the timestamp, not a big deal and makes code less complex
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
