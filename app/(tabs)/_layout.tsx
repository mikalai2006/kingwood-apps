import { Tabs } from "expo-router";

import React, { useEffect, useMemo } from "react";

import { Colors } from "@/utils/Colors";
import { useColorScheme } from "nativewind";
import { Text, View } from "react-native";
import UserTabInfo from "@/components/user/UserTabInfo";

import { activeTaskWorker, modeTheme, user } from "@/store/storeSlice";
import { useAppSelector } from "@/store/hooks";
import { setMode } from "@/utils/mode";
import SIcon from "@/components/ui/SIcon";
import BadgeTabLots from "@/components/badge/BadgeTabLots";
import BadgeTabMessage from "@/components/badge/BadgeTabMessage";
import useMessagesRooms from "@/hooks/useMessagesRooms";
import useTaskStatus from "@/hooks/useTaskStatus";
import usePost from "@/hooks/usePost";
import { useObject, useQuery } from "@realm/react";
import { TaskStatusSchema } from "@/schema";
import { TaskWorkerNotify } from "@/components/task/TaskWorkerNotify";
import useObjects from "@/hooks/useObjects";
import { BSON } from "realm";
import { transparent } from "tailwindcss/colors";
import { TaskWorkerItemStatusIcon } from "@/components/task/TaskWorkItemStatusIcon";
import { useTranslation } from "react-i18next";

export default function TabLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();

  const { t } = useTranslation();

  const activeTaskWorkerFromStore = useAppSelector(activeTaskWorker);
  const activeTaskStatus = useObject(
    TaskStatusSchema,
    new BSON.ObjectId(activeTaskWorkerFromStore?.statusId)
  );

  const userFromStore = useAppSelector(user);

  // if (userFromStore?.id) {
  //   // const { messagesRooms } = useMessagesRooms({
  //   //   userId: userFromStore?.id,
  //   // });

  //   useTaskStatus({});
  //   usePost({});
  //   useObjects({});
  // }
  // const roomIds = useMemo(
  //   () => messagesRooms.map((x) => x._id.toString()) || undefined,
  //   []
  // );
  // useMessages({
  //   roomId: roomIds,
  // });

  const modeThemeFromStore = useAppSelector(modeTheme);
  useEffect(() => {
    console.log("modeThemeFromStore=", modeThemeFromStore);

    setMode(modeThemeFromStore);
    setColorScheme(modeThemeFromStore);
  }, []);

  return (
    <View className="flex-1 bg-s-200 dark:bg-s-950">
      {/* <View className="">
        <TaskWorkerNotify />
      </View> */}
      <View className="flex-auto">
        <Tabs
          backBehavior="history"
          initialRouteName="index"
          screenOptions={{
            tabBarStyle: {
              // minHeight: 60,
              borderTopWidth: 0,
              borderBottomWidth: 0,
              // borderTopColor:
              //   colorScheme === "dark" ? Colors.s[900] : Colors.s[100],
              // padding: 0,
              // margin: 0,
              shadowColor: "transparent",
              // borderColor: colorScheme === "dark" ? Colors.s[800] : Colors.s[100],
              backgroundColor:
                colorScheme === "dark" ? Colors.s[900] : Colors.s[100],
            },
            // headerShadowVisible: true,
            tabBarActiveBackgroundColor:
              colorScheme === "dark" ? Colors.s[900] : Colors.s[100],
            tabBarActiveTintColor:
              colorScheme === "dark" ? Colors.p[300] : Colors.p[700],
            tabBarInactiveTintColor:
              colorScheme === "dark" ? Colors.s[100] : Colors.s[950],
            headerShown: false,
          }}
        >
          <Tabs.Screen
            name="order"
            options={{
              title: t("title.order"),
              tabBarIcon: ({ color, focused }) => (
                <View>
                  <SIcon
                    path={focused ? "iInboxes" : "iInboxes"}
                    size={20}
                    color={color} //focused ? Colors.white : Colors.white
                  />
                  {/* <BadgeTabLots /> */}
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="finance"
            options={{
              title: t("title.finance"),
              // tabBarActiveTintColor: Colors.white,
              // tabBarInactiveTintColor: Colors.white,
              // tabBarItemStyle: {
              //   borderRadius: 50,
              //   backgroundColor:
              //     colorScheme === "dark" ? Colors.s[950] : Colors.s[200],
              //   maxWidth: 80,
              //   height: 80,
              //   // paddingHorizontal: 5,
              //   // paddingVertical: 15,
              //   paddingTop: 10,
              //   marginTop: -25,
              //   borderColor: colorScheme === "dark" ? Colors.s[900] : Colors.s[100],
              //   borderWidth: 7,
              // },
              tabBarIcon: ({ color, focused }) => (
                <SIcon path={"iRubl"} size={30} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="index"
            options={{
              title: t("title.work"),
              tabBarActiveTintColor: activeTaskWorkerFromStore
                ? Colors.white
                : colorScheme === "dark"
                ? Colors.r[200]
                : Colors.white,
              tabBarActiveBackgroundColor: "transparent",
              // tabBarInactiveTintColor: activeTaskWorkerFromStore
              //   ? Colors.white
              //   : colorScheme === "dark"
              //   ? Colors.p[300]
              //   : Colors.p[700],
              tabBarItemStyle: {
                borderRadius: 50,
                backgroundColor: !activeTaskWorkerFromStore
                  ? colorScheme === "dark"
                    ? Colors.r[700]
                    : Colors.r[400]
                  : colorScheme === "dark"
                  ? activeTaskStatus?.color
                  : activeTaskStatus?.color,
                maxWidth: 80,
                height: 80,
                // paddingHorizontal: 5,
                // paddingVertical: 15,
                paddingTop: 5,
                marginTop: -25,
                borderColor:
                  colorScheme === "dark" ? Colors.s[900] : Colors.s[100],
                borderWidth: 7,
                padding: 10,
              },
              tabBarIcon: ({ color, focused }) => (
                // <SIcon
                //   path={"iTimer"}
                //   // path={activeTaskStatus?.icon ? undefined : "iTimer"}
                //   // pathText={activeTaskStatus?.icon}
                //   size={30}
                //   color={color}
                //   // className={activeTaskStatus?.animate}
                // />
                <TaskWorkerItemStatusIcon />
              ),
            }}
          />
          <Tabs.Screen
            name="message"
            options={{
              title: t("title.message"),
              tabBarIcon: ({ color, focused }) => (
                <View>
                  <SIcon
                    path={focused ? "iBell" : "iBell"}
                    size={25}
                    color={color}
                  />
                  {/* <BadgeTabMessage /> */}
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: t("title.profile"),
              // tabBarLabel(props) {
              //   return null;
              // },
              tabBarIcon: ({ color, focused }) =>
                !userFromStore?.images ? (
                  <SIcon
                    path={focused ? "iPerson" : "iPerson"}
                    size={25}
                    color={color}
                  />
                ) : (
                  <UserTabInfo userData={userFromStore} />
                ),
            }}
          />
        </Tabs>
      </View>
    </View>
  );
}
