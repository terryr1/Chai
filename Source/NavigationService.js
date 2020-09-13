import { CommonActions } from "@react-navigation/native";

let _navigator;

function setTopLevelNavigator(navigatorRef) {
  _navigator = navigatorRef;
}

function navigate(notificationData) {
  _navigator.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [
        {
          name: "Main",
          state: {
            routes: [
              {
                name: "Messages",
                state: {
                  index: 1,
                  routes: [
                    {
                      name: "MessageList",
                      params: {
                        user: { id: notificationData.uid },
                      },
                    },
                    {
                      name: "ConvoContainer",
                      params: {
                        id: notificationData.convo_id,
                        pending: notificationData.pending,
                        user: { id: notificationData.uid, primary: notificationData.primary },
                        unread: true,
                      },
                    },
                  ],
                },
                params: {
                  uid: notificationData.uid,
                },
              },
            ],
          },
          params: {
            uid: notificationData.uid,
          },
        },
      ],
    })
  );
}

// add other navigation functions that you need and export them

export default {
  navigate,
  setTopLevelNavigator,
};
