import { View } from "react-native";
import React from "react";

import { FlatList } from "react-native-gesture-handler";
import useTaskWorkers from "@/hooks/useTaskWorkers";
import { useAppSelector } from "@/store/hooks";
import { user } from "@/store/storeSlice";
import { useQuery } from "@realm/react";
import { TaskWorkerSchema } from "@/schema";
import { SSkeleton } from "../ui/SSkeleton";
import { TaskWorkerItem } from "./TaskWorkItem";
import dayjs from "@/utils/dayjs";
import TaskNotFound from "./TaskNotFound";

const TaskWorkList = () => {
  const userFromStore = useAppSelector(user);

  const { isLoading, error } = useTaskWorkers({
    workerId: userFromStore ? [userFromStore.id] : undefined,
    $limit: 100,
  });

  const taskWorkers = useQuery(TaskWorkerSchema, (items) =>
    items.filtered("workerId == $0 AND status != 'finish'", [userFromStore?.id])
  ).filter(
    (y) =>
      dayjs(new Date()).isBetween(dayjs(y.from), dayjs(y.to), "day", "[]") ||
      dayjs(new Date())
        .add(1, "day")
        .isBetween(dayjs(y.from), dayjs(y.to), "day", "[]")
  );

  return (
    <View className="flex-1">
      {isLoading ? (
        <View className="flex p-2">
          {[1, 2, 3, 4, 5].map((item) => (
            <View key={item.toString()} className="flex-auto h-64 pb-4 px-2">
              <SSkeleton className="flex-1 bg-white dark:bg-s-900" />
            </View>
          ))}
        </View>
      ) : taskWorkers.length ? (
        <FlatList
          data={taskWorkers}
          keyExtractor={(item) => item._id.toString()}
          renderItem={({ item }) => (
            <TaskWorkerItem taskWorkerId={item._id.toString()} />
          )}
        />
      ) : (
        <TaskNotFound />
      )}
    </View>
  );
};

export default TaskWorkList;
