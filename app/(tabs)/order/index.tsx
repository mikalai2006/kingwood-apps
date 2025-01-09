import { Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { useAppSelector } from "@/store/hooks";
import { user } from "@/store/storeSlice";
import UIButton from "@/components/ui/UIButton";
import TaskWorkList from "@/components/task/TaskWorkList";

export default function FollowScreen() {
  const userFromStore = useAppSelector(user);

  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-s-200 dark:bg-s-950">
      <SafeAreaView className="flex-1">
        {/* <Text>{JSON.stringify(userFromStore?.postObject?.name)}</Text> */}
        {/* {userFromStore?.postObject?.name === "Монтажник" ? (
          <TaskMontajWorkerList />
        ) : ( */}
        <TaskWorkList />
        {/* )} */}
        <UIButton
          type="secondary"
          text={t("button.completedTask")}
          icon="iChevronRight"
          startText
          onPress={() => {
            router.push("/(tabs)/order/archive");
          }}
        />
      </SafeAreaView>
    </View>
  );
}
