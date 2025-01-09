import { View } from "react-native";
import React from "react";

import { FlatList } from "react-native-gesture-handler";
import { useAppSelector } from "@/store/hooks";
import { user } from "@/store/storeSlice";
import { useQuery } from "@realm/react";
import { TaskMontajWorkerSchema } from "@/schema";
import { SSkeleton } from "../ui/SSkeleton";
import useTaskMontajWorkers from "@/hooks/useTaskMontajWorkers";
import { TaskMontajWorkerItem } from "./TaskMontajWorkerItem";

const TaskMontajWorkerList = () => {
  const userFromStore = useAppSelector(user);

  const { isLoading, error } = useTaskMontajWorkers({
    workerId: userFromStore ? [userFromStore.id] : undefined,
    $limit: 100,
  });

  const taskMontajWorkers = useQuery(TaskMontajWorkerSchema, (items) =>
    items.filtered("workerId == $0 AND status != 'finish'", [userFromStore?.id])
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
      ) : (
        <FlatList
          data={taskMontajWorkers}
          keyExtractor={(item) => item._id.toString()}
          renderItem={({ item }) => (
            <TaskMontajWorkerItem taskMontajWorker={item} />
          )}
        />
      )}
    </View>
  );
};

export default TaskMontajWorkerList;
