import React from "react";
import { View } from "react-native";
import { GiftedChat, Bubble } from "react-native-gifted-chat";
import { unionWith } from "lodash";
import ConvoController from "./../Controllers/ConvoController";
import PendingConvoController from "./../Controllers/PendingConvoController";
import GestureRecognizer from "react-native-swipe-gestures";

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
      //this.props.route.params.updateContainer(this.state.pending, this.controller);
    }
  }

  componentDidMount() {
    this._unsubscribeFocus = this.props.navigation.addListener('focus', () => {
      this.setState({ pending: this.props.route.params.pending }, () => {
        this._isMounted = true;
        this.startController();
      });
    })

    this._unsubscribeBlur = this.props.navigation.addListener('blur', () => {
      console.log('BLURRING')
      this._isMounted = false;
      this.stopController();
    });
  }

  stopController() {
    this.controller.stop("" + this.props.route.params.id);
  }

  componentWillUnmount() {
    this._unsubscribeFocus();
    this._unsubscribeBlur();
  }

  startController() {
    let params = {
      update: (messages) => {
        if (this._isMounted) {
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

  renderBubble (props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#6a8fcc"
          }
        }}
      />
    )
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
