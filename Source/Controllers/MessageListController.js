// const list = [
//     {
//       name: 'Amy Farha',
//       avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
//       subtitle: 'Vice President'
//     },
//     {
//       name: 'Chris Jackson',
//       avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
//       subtitle: 'Vice Chairman'
//     },
//     ... // more items
//   ]

import UserModel from "../Models/UserModel";

function start(callback, id) {
    UserModel.shared.on(callback, id);
}

function stop(id) {
    UserModel.shared.off(id);
}

export default {start, stop}