import React from "react";
import { View } from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
import { unionWith } from "lodash";
import ConvoController from "./../Controllers/ConvoController";
import PendingConvoController from "./../Controllers/PendingConvoController";
import GestureRecognizer from "react-native-swipe-gestures";

//IMPORTANT: ON Blur change the stuff on mount/dismount to onblur/focus
//TODO: notifications
class Convo extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.pending != prevState.pending || !this._isMounted) {
      if (this.state.pending) {
        this.controller = PendingConvoController;
      } else {
        this.controller = ConvoController;
      }
      this.props.route.params.updateContainer(this.state.pending, this.controller);
    }
  }

  componentDidMount() {
    this.setState({ pending: this.props.route.params.pending }, () => {
      this._isMounted = true;
      this.startController();
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.controller.stop("" + this.props.route.params.id);
  }

  startController() {
    console.log(this.state.messages);
    let params = {
      update: (messages) => {
        if (this._isMounted) {
          console.log('received')
          console.log(messages)
          const new_messages = unionWith(this.state.messages, messages, (a, b) => a._id == b._id);
          const sorted_msgs = new_messages.sort((a, b) => {
            return b._id - a._id;
          });
          this.setState({ messages: sorted_msgs });
        }
      },
      id: "" + this.props.route.params.id,
    };

    this.controller.start(params.update.bind(this), params.id, () => {
      this.setState({ pending: !this.state.pending });
      this.startController();
    });
  }

  async send(messages) {
    if (this.state.pending && !this.props.route.params.user.primary) {
      await this.switchPendingState();
    }
    this.controller.send(messages, "" + this.props.route.params.id);
  }

  async switchPendingState() {
    await this.controller.stop("" + this.props.route.params.id);
    this.setState({ pending: !this.state.pending, messages: [] }, () => {
      this.controller.switchPendingStateToThis(this.props.route.params.user.id, this.props.route.params.id);
      this.startController();
    });
  }

  static navigationOptions = ({ navigation }) => ({
    title: (navigation.state.params || {}).name || "Chat!",
  });

  state = {
    messages: [],
    pending: false,
  };

  render() {
    return (
      <GiftedChat
        messages={this.state.messages}
        onSend={this.send.bind(this)}
        user={{ _id: this.props.route.params.user.id, name: "Anonymous" }}
      />
    );
  }
}
export default Convo;
