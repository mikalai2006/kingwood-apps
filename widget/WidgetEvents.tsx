import "react-native-get-random-values";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  activeTaskWorker,
  setActiveTaskWorker,
  tokens,
  user,
} from "@/store/storeSlice";
import { useQuery, useRealm } from "@realm/react";
import { ITaskWorker, IWsMessage } from "@/types";
import { BSON, UpdateMode } from "realm";
import {
  MessageRoomSchema,
  MessageSchema,
  OrderSchema,
  UserSchema,
} from "@/schema";
import useAuth from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { wsAPI } from "@/utils/global";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function WidgetEvents() {
  const { onSyncToken, isAccessTokenExpired } = useAuth();
  const { t } = useTranslation();

  const realm = useRealm();
  const userFromStore = useAppSelector(user);

  const dispatch = useAppDispatch();

  const usersFromRealm = useQuery(UserSchema);
  const ordersFromRealm = useQuery(OrderSchema);
  // const offersFromRealm = useQuery(OfferSchema);
  const messagesFromRealm = useQuery(MessageSchema);
  const messagesRoomsFromRealm = useQuery(MessageRoomSchema);

  const tokensFromStore = useAppSelector(tokens);
  const activeTaskFromStore = useAppSelector(activeTaskWorker);
  const activeTaskFromStoreRef = useRef(activeTaskFromStore);

  const [expoPushToken, setExpoPushToken] = useState("");
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>(
    []
  );
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      (token) => token && setExpoPushToken(token)
    );

    if (Platform.OS === "android") {
      Notifications.getNotificationChannelsAsync().then((value) =>
        setChannels(value ?? [])
      );
    }
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    activeTaskFromStoreRef.current = Object.assign({}, activeTaskFromStore);
  }, [activeTaskFromStore]);

  const onDetectActiveTaskWork = useCallback((data: IWsMessage) => {
    // console.log(
    //   "taskWorker ids=",
    //   activeTaskFromStoreRef.current?.id,
    //   data.content.id
    // );
    if (data.method === "DELETE") {
      if (activeTaskFromStoreRef.current?.id === data.content.id) {
        dispatch(setActiveTaskWorker(null));
      }
    } else {
      if (activeTaskFromStoreRef.current?.id === data.content.id) {
        dispatch(setActiveTaskWorker(data.content));
      }
    }
  }, []);

  useEffect(() => {
    const onInitSocket = async () => {
      if (!tokensFromStore?.access_token) {
        return;
      }
      const _tokens = await onSyncToken();
      if (!_tokens) {
        // console.log("tokens: ", tokens);
        throw new Error(t("general:httpError.notFoundToken"));
      }
      const stateNet = await NetInfo.fetch();
      // console.log('onFetch:::::', stateNet);

      if (!stateNet.isConnected) {
        throw new Error(t("general:httpError.notConnect"));
      }

      const _socket = new WebSocket(wsAPI);
      _socket.onopen = function () {
        _socket.send(
          JSON.stringify({
            type: "jwt",
            content: tokensFromStore?.access_token,
          })
        );
        console.log("Open websocket: ", tokensFromStore?.access_token);
      };
      _socket.onmessage = function (event) {
        console.log("event.data: ", event.data);
        const data: IWsMessage = JSON.parse(event.data);
        const { method } = data;

        if (!userFromStore) {
          return;
        }

        realm.write(() => {
          try {
            switch (data.service) {
              case "user":
                realm.create(
                  "UserSchema",
                  {
                    ...data.content,
                    _id: new BSON.ObjectId(data.content.id || data.content._id),
                  },
                  UpdateMode.Modified
                );
                break;

              case "order":
                realm.create(
                  "OrderSchema",
                  {
                    ...data.content,
                    _id: new BSON.ObjectId(data.content.id || data.content._id),
                  },
                  UpdateMode.Modified
                );
                break;

              case "task":
                if (data.method === "DELETE") {
                  realm.delete(
                    realm.objectForPrimaryKey(
                      "TaskSchema",
                      new BSON.ObjectId(data.content.id)
                    )
                  );
                } else {
                  realm.create(
                    "TaskSchema",
                    {
                      ...data.content,
                      _id: new BSON.ObjectId(
                        data.content.id || data.content._id
                      ),
                    },
                    UpdateMode.Modified
                  );
                }
                break;

              case "taskWorker":
                if (data.method === "DELETE") {
                  realm.delete(
                    realm.objectForPrimaryKey(
                      "TaskWorkerSchema",
                      new BSON.ObjectId(data.content.id)
                    )
                  );

                  onDetectActiveTaskWork(data);
                } else {
                  realm.create(
                    "TaskWorkerSchema",
                    {
                      ...data.content,
                      _id: new BSON.ObjectId(
                        data.content.id || data.content._id
                      ),
                      sortOrder: data.content.sortOrder || 0,
                    },
                    UpdateMode.Modified
                  );

                  onDetectActiveTaskWork(data);
                }
                break;

              // case "TaskMontajWorker":
              //   realm.create(
              //     "TaskMontajWorkerSchema",
              //     {
              //       ...data.content,
              //       _id: new BSON.ObjectId(data.content.id || data.content._id),
              //       sortOrder: data.content.sortOrder || 0,
              //     },
              //     UpdateMode.Modified
              //   );

              //   if (activeTaskFromStore?.id === data.content.id) {
              //     dispatch(setActiveTaskWorker(data.content));
              //   }
              //   break;

              case "taskStatus":
                realm.create(
                  "TaskStatusSchema",
                  {
                    ...data.content,
                    _id: new BSON.ObjectId(data.content.id || data.content._id),
                    enabled: data.content.enabled || 0,
                    start: data.content.enabled || 0,
                    finish: data.content.enabled || 0,
                    process: data.content.enabled || 0,
                  },
                  UpdateMode.Modified
                );
                break;

              case "question":
                if (method === "DELETE") {
                  realm.delete(
                    realm.objectForPrimaryKey(
                      "QuestionSchema",
                      new BSON.ObjectId(data.content.id)
                    )
                  );
                } else {
                  realm.create(
                    "QuestionSchema",
                    {
                      ...data.content,
                      _id: new BSON.ObjectId(data.content.id),
                    },
                    UpdateMode.Modified
                  );
                }
                break;

              case "message":
                realm.create(
                  "MessageSchema",
                  {
                    ...data.content,
                    _id: new BSON.ObjectId(data.content.id || data.content._id),
                  },
                  UpdateMode.Modified
                );
                break;

              case "messageRoom":
                realm.create(
                  "MessageRoomSchema",
                  {
                    ...data.content,
                    _id: new BSON.ObjectId(data.content.id || data.content._id),
                  },
                  UpdateMode.Modified
                );
                break;

              default:
                console.log("UNKNOWN EVENT", event);

                break;
            }

            if (data.content.user) {
              realm.create(
                "UserSchema",
                {
                  ...data.content.user,
                  _id: new BSON.ObjectId(
                    data.content.user.id || data.content.user._id
                  ),
                },
                UpdateMode.Modified
              );
            }
          } catch (e) {
            console.log(
              `WidgetEvents error: ${data.service}: `,
              e,
              data.content
            );
          }
        });

        // Notifications.scheduleNotificationAsync({
        //   content: {
        //     title: "Look at that notification",
        //     body: data.content,
        //     sound: true,
        //     data: {
        //       url: "/modaloffer/6703ca0e1aa5474e6ea7e2c7",
        //     },
        //   },
        //   trigger: null,
        // });
      };
      console.log("Connect Websocket");
      return _socket;
    };

    let socket: WebSocket | undefined;

    onInitSocket().then((r) => (socket = r));

    return () => socket?.close();
  }, [tokensFromStore]);
  console.log("token PUSHN: ", expoPushToken);

  return null;
  // (
  //   <View
  //     style={{
  //       flex: 1,
  //       alignItems: "center",
  //       justifyContent: "space-around",
  //     }}
  //   >
  //     <Text>Your expo push token: {expoPushToken}</Text>
  //     <Text>{`Channels: ${JSON.stringify(
  //       channels.map((c) => c.id),
  //       null,
  //       2
  //     )}`}</Text>
  //     <View style={{ alignItems: "center", justifyContent: "center" }}>
  //       <Text>
  //         Title: {notification && notification.request.content.title}{" "}
  //       </Text>
  //       <Text>Body: {notification && notification.request.content.body}</Text>
  //       <Text>
  //         Data:{" "}
  //         {notification && JSON.stringify(notification.request.content.data)}
  //       </Text>
  //     </View>
  //     <Button
  //       title="Press to schedule a notification"
  //       onPress={async () => {
  //         await schedulePushNotification();
  //       }}
  //     />
  //   </View>
  // );
}

async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "You've got mail! 📬",
      body: "Here is the notification body",
      data: { data: "goes here", test: { test1: "more data" }, url: "/" },
    },
    trigger: { seconds: 2 },
  });
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // EAS projectId is used here.
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error("Project ID not found");
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      // console.log(token);
    } catch (e) {
      token = `${e}`;
    }
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return token;
}
