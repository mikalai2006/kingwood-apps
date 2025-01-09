import { Alert, Animated, Text, View } from "react-native";
import UIButton from "@/components/ui/UIButton";
import { useColorScheme } from "nativewind";
import {
  OrderSchema,
  TaskMontajSchema,
  TaskMontajWorkerSchema,
  TaskStatusSchema,
} from "@/schema";
import useTask from "@/hooks/useTask";
import { TaskOrder } from "./TaskOrder";
import { useState } from "react";
import { useFetchWithAuth } from "@/hooks/useFetchWithAuth";
import { hostAPI } from "@/utils/global";
import { useObject, useQuery, useRealm } from "@realm/react";
import { BSON, UpdateMode } from "realm";
import {
  ITaskMontajWorker,
  ITaskMontajWorkerPopulate,
  ITaskWorker,
} from "@/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  activeTaskWorker,
  setActiveTaskWorker,
  workTime,
  user,
} from "@/store/storeSlice";
import { useTranslation } from "react-i18next";
import TaskIcon from "./TaskIcon";
import { ObjectsSchema } from "@/schema/ObjectsSchema";
import { TaskObject } from "./TaskObject";

export type TaskMontajWorkerItemProps = {
  taskMontajWorker: TaskMontajWorkerSchema;
};

export function TaskMontajWorkerItem({
  taskMontajWorker,
}: TaskMontajWorkerItemProps) {
  const { colorScheme } = useColorScheme();

  const userFromStore = useAppSelector(user);

  const { t } = useTranslation();

  const { onFetchWithAuth } = useFetchWithAuth();

  const realm = useRealm();

  const dispatch = useAppDispatch();

  const workTimeFromStore = useAppSelector(workTime);

  const activeTaskFromStore = useAppSelector(activeTaskWorker);

  useTask({ id: [taskMontajWorker.taskId] });

  const allTaskStatus = useQuery(TaskStatusSchema);
  const allObject = useQuery(ObjectsSchema);

  const taskMontaj = useObject(
    TaskMontajSchema,
    new BSON.ObjectId(taskMontajWorker.taskId)
  );

  const taskStatus = useObject(
    TaskStatusSchema,
    new BSON.ObjectId(taskMontajWorker.statusId)
  );

  const [loading, setLoading] = useState(false);

  const toggleTaskMontajWorker = async (statusName: string) => {
    setLoading(true);

    const _status = allTaskStatus.find((x) => x.status === statusName);
    if (!_status) {
      return;
    }

    const _statusPause = allTaskStatus.find((x) => x.status === "pause");
    if (!_statusPause) {
      return;
    }

    // pause prev task.
    if (
      activeTaskFromStore != null &&
      activeTaskFromStore.id != taskMontajWorker._id.toString()
    ) {
      await onFetchWithAuth(
        `${hostAPI}/task_montaj_worker/${activeTaskFromStore.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            statusId: _statusPause._id.toString(),
            status: _statusPause.status,
          }),
        }
      )
        .then((res) => res.json())
        .then((res: ITaskWorker) => {
          realm.write(() => {
            try {
              realm.create(
                "TaskMontajWorkerSchema",
                {
                  ...res,
                  _id: new BSON.ObjectId(res.id),
                  sortOrder: res.sortOrder || 0,
                },
                UpdateMode.Modified
              );

              // if (res.status === "process") {
              //   dispatch(setActiveTaskWorker(Object.assign({}, res)));
              // } else {
              //   dispatch(setActiveTaskWorker(null));
              // }
            } catch (e) {
              console.log("toggleTask prev error: ", e);
            }
          });
        })
        .catch((e) => {
          console.log("toggleTaskWorker prev Error", e);
        });
    }

    return await onFetchWithAuth(
      `${hostAPI}/task_montaj_worker/${taskMontajWorker._id.toString()}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          //productId: params.id,
          statusId: _status._id.toString(),
          status: statusName,
        }),
      }
    )
      .then((res) => res.json())
      .then((res: ITaskMontajWorkerPopulate) => {
        realm.write(() => {
          try {
            realm.create(
              "TaskMontajWorkerSchema",
              {
                ...res,
                _id: new BSON.ObjectId(res.id),
                sortOrder: res.sortOrder || 0,
              },
              UpdateMode.Modified
            );

            if (res.status === "process") {
              dispatch(setActiveTaskWorker(Object.assign({}, res)));
            } else {
              dispatch(setActiveTaskWorker(null));
            }
            // if (res.statusId === "6749ffa6d6b4324345382aec") {
            // } else {
            //   dispatch(setActiveTaskWorker(null));
            // }
          } catch (e) {
            console.log("toggleTask error: ", e);
          }
        });
      })
      .catch((e) => {
        console.log("toggleTaskWorker Error", e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  function onPauseTaskMontaj(task: TaskMontajSchema): void {
    const objects = allObject.filtered(
      "_id=$0",
      new BSON.ObjectId(task.objectId)
    );

    if (!objects.length) {
      return;
    }

    Alert.alert(
      t("info.taskPause"),
      t("info.taskMontajPauseDescription", {
        objectName: objects[0]?.name,
      }),
      [
        // {
        //   text: "Ask me later",
        //   onPress: () => console.log("Ask me later pressed"),
        // },
        {
          text: t("button.no"),
          onPress: () => {},
          style: "cancel",
        },
        {
          text: t("button.yes"),
          onPress: () => {
            toggleTaskMontajWorker("pause");
          },
        },
      ]
    );
  }

  function onProcessTaskMontaj(task: TaskMontajSchema): void {
    const objects = allObject.filtered(
      "_id=$0",
      new BSON.ObjectId(task.objectId)
    );

    if (!objects.length) {
      return;
    }

    Alert.alert(
      t("info.taskProcess"),
      activeTaskFromStore != null
        ? t("info.taskMontajProcessRunOtherDescription", {
            objectName: `${objects[0]?.name}`,
            prevObjectName: `№${activeTaskFromStore?.object?.name}`,
          })
        : t("info.taskMontajProcessDescription", {
            objectName: `${objects[0]?.name}`,
          }),
      [
        // {
        //   text: "Ask me later",
        //   onPress: () => console.log("Ask me later pressed"),
        // },
        {
          text: t("button.no"),
          onPress: () => {},
          style: "cancel",
        },
        {
          text: t("button.yes"),
          onPress: () => {
            toggleTaskMontajWorker("process");
          },
        },
      ]
    );
  }

  // function onCompletedTask(task: TaskMontajSchema): void {
  //   const objects = allObject.filtered(
  //     "_id=$0",
  //     new BSON.ObjectId(task.objectId)
  //   );

  //   if (!objects.length) {
  //     return;
  //   }

  //   Alert.alert(
  //     t("info.taskCompleted"),
  //     t("info.taskCompletedDescription", {
  //       orderName: `№${orders[0]?.number}: ${orders[0]?.name}`,
  //       taskName: task.name,
  //     }),
  //     [
  //       // {
  //       //   text: "Ask me later",
  //       //   onPress: () => console.log("Ask me later pressed"),
  //       // },
  //       {
  //         text: t("button.no"),
  //         onPress: () => console.log("Cancel Pressed"),
  //         style: "cancel",
  //       },
  //       {
  //         text: t("button.yes"),
  //         onPress: () => {
  //           toggleTaskNontajWorker("finish");
  //         },
  //       },
  //     ]
  //   );
  // }

  return taskMontaj ? (
    <View className="w-full p-2 px-4">
      <View
        className="rounded-lg shadow-lg bg-white dark:bg-s-800"
        // style={{ backgroundColor: taskStatus?.color }}
      >
        <View className="rounded-t-lg border-b border-black/10 dark:border-black/10  p-2">
          <View className="px-1">
            <TaskObject objectId={taskMontaj.objectId} />
          </View>
        </View>
        <View className="p-2 rounded-b-lg">
          {/* <View style={{ aspectRatio: 1 }}>
          <RImage
            className="object-cover aspect-square"
            image={task?.images ? task?.images[0] : null}
            style={{ aspectRatio: 1, width: "100%" }}
          />
        </View> */}
          <View className="flex flex-row items-center px-2">
            {taskStatus?.icon && (
              <TaskIcon
                key={taskStatus._id.toString()}
                statusId={taskStatus._id.toString()}
                className="p-2"
              />
            )}
            <View className="p-2">
              {/* <Text className="text-s-500 leading-5 mb-1">Задача</Text> */}
              <Text
                className="text-xl leading-6 text-g-950 dark:text-s-100"
                numberOfLines={2}
                lineBreakMode="tail"
              >
                {taskMontaj.name}
              </Text>
              <Text className="text-s-500 leading-5 mb-1">
                {taskStatus?.name}{" "}
              </Text>
            </View>
          </View>
          {taskStatus?.status !== "finish" && (
            <View className="flex flex-row p-2 gap-4">
              <View className="flex-auto flex items-start">
                {/* <Text>{JSON.stringify(activeTaskFromStore)}</Text> */}
                {taskStatus?.status === "process" ? (
                  <UIButton
                    type="secondary"
                    text={t("button.pauseTask")}
                    loading={loading}
                    onPress={() => onPauseTaskMontaj(taskMontaj)}
                  ></UIButton>
                ) : (
                  <UIButton
                    type="primary"
                    text={t("button.goTask")}
                    loading={loading}
                    disabled={
                      workTimeFromStore === null //activeTaskFromStore !== null ||
                    }
                    onPress={() => onProcessTaskMontaj(taskMontaj)}
                  ></UIButton>
                )}
              </View>
              {/* <UIButton
                type="secondary"
                text={t("button.finishTask")}
                disabled={
                  activeTaskFromStore?.id !== taskMontajWorker._id.toString()
                }
                onPress={() => onCompletedTask(taskMontaj)}
              ></UIButton> */}
            </View>
          )}
          {/* {numColumns === 1 && (
          <View className="px-4 pb-4 flex flex-row gap-2">
            <View className="flex-auto flex flex-row flex-wrap items-start gap-2">
              <View className="bg-p-500 py-0.5 px-1.5 rounded-lg">
                <Text className="text-white">Отдам даром</Text>
              </View>
              <View className="bg-green-500 py-0.5 px-1.5 rounded-lg">
                <Text className="text-white">Обмен</Text>
              </View>
            </View>

            <View className="flex flex-row gap-4 items-end"></View>
          </View>
        )} */}
        </View>
      </View>
    </View>
  ) : (
    <Text>Not found task</Text>
  );
}
