import { View, Text } from "react-native";
import React from "react";
import SIcon from "../ui/SIcon";
import UserInfoAvatar from "../user/UserInfoAvatar";
import { Colors } from "@/utils/Colors";
import { NotifySchema } from "@/schema";
import dayjs, { formatDateTime } from "@/utils/dayjs";
import Card from "../Card";
import UserInfoInline from "../user/UserInfoInline";

export type NotifyItemProps = {
  notify: NotifySchema;
};

const NotifyItem = ({ notify }: NotifyItemProps) => {
  return notify ? (
    <Card className="flex flex-row flex-wrap items-center gap-4 p-4 mb-3">
      <Text
        className="text-lg text-s-800 dark:text-s-200 leading-5"
        lineBreakMode="tail"
        numberOfLines={2}
      >
        {notify.message}
      </Text>
      <View className="flex flex-row gap-4">
        <UserInfoInline key={notify.userId} userId={notify.userId} />
        <Text className="text-s-500">
          {dayjs(notify.createdAt).utc().fromNow()}
        </Text>
      </View>
      {/* <View className="flex-auto flex flex-row items-center gap-4">
        <View>
          <UserInfoAvatar
            key={notify.userId}
            userId={notify.userId}
            borderColor="border-white dark:border-s-800"
          />
        </View>
        <View className="rotate-180">
          <SIcon path="iChevronLeftDouble" size={20} color={Colors.s[400]} />
        </View>
        <View className="flex-auto">
        </View>
        <View className="rotate-180">
          <SIcon path="iChevronLeftDouble" size={20} color={Colors.s[400]} />
        </View>
        <View>
          <UserInfoAvatar
            key={notify.userTo}
            userId={notify.userTo}
            borderColor="border-white dark:border-s-800"
          />
        </View>
      </View> */}
    </Card>
  ) : null;
};

export default NotifyItem;
