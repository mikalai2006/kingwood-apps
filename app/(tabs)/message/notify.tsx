import { View } from "react-native";

import { FlatList } from "react-native-gesture-handler";
import { useAppSelector } from "@/store/hooks";
import { user } from "@/store/storeSlice";
import { useQuery } from "@realm/react";
import { NotifySchema } from "@/schema";
import NotifyItem from "@/components/notify/NotifyItem";
import UseNotify from "@/hooks/useNotify";

export default function NotifyScreen() {
  const userFromStore = useAppSelector(user);

  const { isLoading } = UseNotify({
    userTo: userFromStore?.id ? [userFromStore?.id] : undefined,
  });

  const notifys = useQuery(
    NotifySchema,
    (items) =>
      items.filtered("(userTo == $0 || userId == $0)", userFromStore?.id),
    [userFromStore]
  );

  return (
    <View className="flex-1 bg-s-200 dark:bg-s-950">
      {!notifys.length ? (
        <View></View>
      ) : (
        <FlatList
          className="p-4"
          data={notifys}
          keyExtractor={(item) => item._id.toString()}
          renderItem={({ item }) => <NotifyItem notify={item} />}
        />
      )}
    </View>
  );
}
