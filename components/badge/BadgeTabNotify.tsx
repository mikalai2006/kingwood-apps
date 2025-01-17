import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { useQuery } from "@realm/react";
import { NotifySchema } from "@/schema";
import { useAppSelector } from "@/store/hooks";
import { user } from "@/store/storeSlice";
import UseNotify from "@/hooks/useNotify";

const BadgeTabNotify = () => {
  const userFromStore = useAppSelector(user);

  const { isLoading } = UseNotify({
    userTo: userFromStore?.id ? [userFromStore.id] : undefined,
  });

  const newNotify = useQuery(NotifySchema, (items) =>
    items.filtered("userTo == $0 AND status == 0", userFromStore?.id)
  );

  return newNotify?.length ? (
    <View className="w-5 h-5 rounded-full bg-green-500 absolute -top-1 -right-2 border-2 border-s-100 dark:border-s-800">
      <Text>{newNotify.length}</Text>
    </View>
  ) : null;
};

export default BadgeTabNotify;
