import React from 'react';
import {View} from 'react-native'
import { GiftedChat } from 'react-native-gifted-chat';
import {unionWith} from 'lodash'
import ConvoController from './../Controllers/ConvoController'
import PendingConvoController from './../Controllers/PendingConvoController'
import GestureRecognizer from 'react-native-swipe-gestures'

//TODO: notifications
class Convo extends React.Component {

  constructor(props) {
      super(props);
  }

  componentDidUpdate(prevProps, prevState) {
    if(this.state.pending != prevState.pending) {
      if(this.state.pending) {
        this.controller = PendingConvoController;
        //check the prev state to see if another user responded, if so switch to not pending
      } else {
        this.controller = ConvoController;
      }
    }
  }

  componentDidMount() {
    this._isMounted = true;
    if(this.props.route.params.pending) {
      this.controller = PendingConvoController;
    } else {
      this.controller = ConvoController;
    }

    this.setState({pending: this.props.route.params.pending})

    this.startController();
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.controller.stop('' + this.props.route.params.id)
  }

  startController() {
    let params = {update: (messages) => { //prob use lowdash union
                      if(this._isMounted) {
                        const new_messages = unionWith(this.state.messages, messages, (a, b) => (a._id == b._id))
                        const sorted_msgs = new_messages.sort((a, b) => {return b._id - a._id})
                        this.setState( 
                                      ({messages: sorted_msgs}))
                      }},
              id: '' + this.props.route.params.id};

    this.controller.start(params.update.bind(this), params.id, () => {this.setState({pending: !this.state.pending}); this.startController()})
  }

  async send(messages) {
    if(this.state.pending && this.state.messages[0].user._id != this.props.route.params.user.id) {
      await this.switchPendingState();
    }
    this.controller.send(messages, '' + this.props.route.params.id);
  }

  async switchPendingState() {
    await this.controller.stop('' + this.props.route.params.id);
    this.setState({pending: !this.state.pending}, () => {
      this.controller.switchPendingState(this.props.route.params.user.id, this.props.route.params.id);
      this.startController()})
  }

  static navigationOptions = ({ navigation }) => ({
    title: (navigation.state.params || {}).name || 'Chat!',
  });
  
  state = {
    messages: [],
    pending: false
  };

  async onSwipeLeft() {
    console.log('swipe left');
    if(!this.state.pending) {
      const convo = await this.controller.get(this.props.route.params.id)
      console.log(convo)
      if(convo.og_id == this.props.route.params.user.id)
        this.props.navigation.navigate('ConvoOptions', {id: this.props.route.params.id, user: this.props.route.params.user, pending: this.state.pending})
      else {
        //component that just ends convo
      }
    } else  {
      //new component with no rating
      //this.props.navigation.navigate('ConvoOptions', {id: this.props.route.params.id, user: this.props.route.params.user, pending: this.state.pending})
    }
    
  }
 
  render() {
    return (
      <GestureRecognizer
        onSwipeLeft={(state) => this.onSwipeLeft()}
        //onSwipeRight={(state) => this.onSwipeRight()}
        style={{
          flex: 1
        }}
        >
        <GiftedChat
          messages={this.state.messages}
          onSend={this.send.bind(this)}
          user={{_id: this.props.route.params.user.id, name: "Anonymous"}}
        />
      </GestureRecognizer>
    );
  }
}
export default Convo;