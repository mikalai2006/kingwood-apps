import { View, Text } from "react-native";
import React from "react";
import Card from "../Card";
import { useTranslation } from "react-i18next";

const TaskNotFound = () => {
  const { t } = useTranslation();

  return (
    <View className="p-4">
      <Card>
        <Text className="text-lg text-s-800 dark:text-s-200 leading-6">
          {t("info.taskNotFound")}
        </Text>
      </Card>
    </View>
  );
};

export default TaskNotFound;