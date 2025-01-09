import { Animated, View } from "react-native";
import { useColorScheme } from "nativewind";
import { OrderSchema, TaskStatusSchema } from "@/schema";
import { useEffect } from "react";
import { useFetchWithAuth } from "@/hooks/useFetchWithAuth";
import { useObject, useQuery, useRealm } from "@realm/react";
import { BSON } from "realm";
import SIcon from "../ui/SIcon";
import { Easing } from "react-native-reanimated";
import { Colors } from "@/utils/Colors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { activeTaskWorker, user, workTime } from "@/store/storeSlice";
import { useTranslation } from "react-i18next";
import { TaskWorkerNotify } from "./TaskWorkerNotify";
import { TaskWorkerNotifyTimer } from "./TaskWorkerNotifyTimer";
import { TaskWorkerNotifyActiveTaskNo } from "./TaskWorkerNotifyActiveTaskNo";
import TaskIcon from "./TaskIcon";

export type TaskWorkItemStatusIconProps = {};

export function TaskWorkerItemStatusIcon({}: TaskWorkItemStatusIconProps) {
  const { colorScheme } = useColorScheme();

  const { t } = useTranslation();

  const { onFetchWithAuth } = useFetchWithAuth();

  const realm = useRealm();

  const dispatch = useAppDispatch();

  const userFromStore = useAppSelector(user);

  const workTimeFromStore = useAppSelector(workTime);

  const activeTaskFromStore = useAppSelector(activeTaskWorker);

  // const { task } = useTask({ id: taskWorker.taskId });

  const allTaskStatus = useQuery(TaskStatusSchema);
  const allOrders = useQuery(OrderSchema);

  const taskStatus = useObject(
    TaskStatusSchema,
    new BSON.ObjectId(activeTaskFromStore?.statusId)
  );

  return (
    <View>
      {taskStatus?._id ? (
        <View>
          {taskStatus?.icon && (
            <TaskIcon statusId={taskStatus._id.toString()} />
          )}
        </View>
      ) : (
        <View>
          <SIcon
            path={"iTimer"}
            size={30}
            color={colorScheme === "dark" ? Colors.white : Colors.white}
          />
        </View>
      )}
      <View className="flex">
        {workTimeFromStore !== null ? (
          <View className="absolute -bottom-8 -left-8 flex items-center w-24 rounded-lg bg-p-300 dark:bg-p-600 pt-1.5">
            <TaskWorkerNotifyTimer
              short
              className="mt-1.5 text-s-900 font-medium dark:text-white text-base"
            />
          </View>
        ) : (
          <View className="absolute bottom-8 -left-36 w-80 p-0 rounded-md">
            <TaskWorkerNotify short />
          </View>
        )}
        {activeTaskFromStore == null && workTimeFromStore !== null && (
          <View className="absolute bottom-8 -left-36 w-80 p-0 rounded-md">
            <TaskWorkerNotifyActiveTaskNo />
          </View>
        )}
      </View>
    </View>
  );
}
