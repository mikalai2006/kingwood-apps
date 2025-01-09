import { Alert, Text, View } from "react-native";
import RImage from "../r/RImage";
import UIButton from "../ui/UIButton";
import { router } from "expo-router";
import { useObject, useQuery, useRealm } from "@realm/react";
import { UserSchema } from "@/schema/UserSchema";
import { useColorScheme } from "nativewind";
// import { BSON } from "realm";
import {
  OrderSchema,
  TaskSchema,
  TaskStatusSchema,
  WorkTimeSchema,
} from "@/schema";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  activeTaskWorker,
  // setTimeWorkEnd,
  // setTimeWorkStart,
  // timeWorkStart,
  // timeWorkEnd,
  // clearTimeWork,
  setActiveTaskWorker,
  setWorkTime,
  user,
  workTime,
} from "@/store/storeSlice";
import SIcon from "../ui/SIcon";
import { Colors } from "@/utils/Colors";
import { TaskWorkerNotifyTimer } from "./TaskWorkerNotifyTimer";
import { TaskWorkerNotifyActiveTask } from "./TaskWorkerNotifyActiveTask";
import { useMemo, useState } from "react";
import { useFetchWithAuth } from "@/hooks/useFetchWithAuth";
import { hostAPI } from "@/utils/global";
import { ITaskWorker, IWorkTime } from "@/types";
import { BSON, UpdateMode } from "realm";
import dayjs from "@/utils/dayjs";
import { useTranslation } from "react-i18next";
import { TaskWorkerNotifyActiveTaskNo } from "./TaskWorkerNotifyActiveTaskNo";

export type TaskWorkerNotifyProps = {
  short?: boolean;
};

export function TaskWorkerNotify({ short }: TaskWorkerNotifyProps) {
  const { colorScheme } = useColorScheme();

  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const userFromStore = useAppSelector(user);

  const { onFetchWithAuth } = useFetchWithAuth();

  const workTimeFromStore = useAppSelector(workTime);

  const realm = useRealm();

  const allWorkTime = useQuery(WorkTimeSchema);

  const allOrders = useQuery(OrderSchema);

  const currentWorkTime = useMemo(() => {
    return allWorkTime.find((x) => x._id.toString() === workTimeFromStore?.id);
  }, []);

  const activeTaskWorkerFromStore = useAppSelector(activeTaskWorker);
  // const timeWorkStartFromStore = useAppSelector(timeWorkStart);
  // const timeWorkEndFromStore = useAppSelector(timeWorkEnd);

  const allTaskStatus = useQuery(TaskStatusSchema);

  // const activeTaskStatus = useObject(
  //   TaskStatusSchema,
  //   new BSON.ObjectId(activeTaskWorkerFromStore?.statusId)
  // );
  // const user = useObject(UserSchema, new BSON.ObjectId(task.userId));

  const [loading, setLoading] = useState(false);

  const onStartPrevTask = async () => {
    const _status = allTaskStatus.find((x) => x.status === "process");
    if (!_status) {
      return;
    }

    await onFetchWithAuth(
      `${hostAPI}/task_worker/${activeTaskWorkerFromStore?.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          // statusId: "6749ffe3d6b4324345382aed",
          statusId: _status._id.toString(),
          status: _status.status,
        }),
      }
    )
      .then((res) => res.json())
      .then((res: ITaskWorker) => {
        try {
          console.log("onEndWorkTime res: ", res);

          realm.write(() => {
            if (res.id) {
              realm.create(
                "TaskWorkerSchema",
                {
                  ...res,
                  _id: new BSON.ObjectId(res.id),
                  sortOrder: res.sortOrder || 0,
                },
                UpdateMode.Modified
              );
            }
          });

          dispatch(setActiveTaskWorker(res));
        } catch (e) {
          console.log("onEndWorkTime error: ", e);
        }
      })
      .catch((e) => {
        console.log("onEndWorkTime Error", e);
      })
      .finally(() => {
        setLoading(false);
        // dispatch(clearTimeWork());
      });
  };

  const onEndWorkTime = async () => {
    const _status = allTaskStatus.find((x) => x.status === "pause");
    if (!_status || workTimeFromStore === null) {
      return;
    }
    // console.log("onEndWorkTime:", activeTaskWorkerFromStore);

    setLoading(true);
    // dispatch(setTimeWorkEnd(new Date().getTime()));
    await onFetchWithAuth(
      `${hostAPI}/task_worker/${activeTaskWorkerFromStore?.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          // statusId: "6749ffe3d6b4324345382aed",
          statusId: _status._id.toString(),
          status: _status.status,
        }),
      }
    )
      .then((res) => res.json())
      .then((res: ITaskWorker) => {
        try {
          console.log("onEndWorkTime res: ", res);

          realm.write(() => {
            if (res.id) {
              realm.create(
                "TaskWorkerSchema",
                {
                  ...res,
                  _id: new BSON.ObjectId(res.id),
                  sortOrder: res.sortOrder || 0,
                },
                UpdateMode.Modified
              );
              dispatch(setActiveTaskWorker(res));
            }
          });
        } catch (e) {
          console.log("onEndWorkTime error: ", e);
        }
      })
      .catch((e) => {
        console.log("onEndWorkTime Error", e);
      })
      .finally(() => {
        setLoading(false);
        // dispatch(clearTimeWork());
      });

    const timeDate = dayjs(new Date()).utc();

    await onFetchWithAuth(`${hostAPI}/work_time/${workTimeFromStore}`, {
      method: "PATCH",
      body: JSON.stringify({
        // statusId: "6749ffe3d6b4324345382aed",
        to: timeDate.format(),
      }),
    })
      .then((res) => res.json())
      .then((res: IWorkTime) => {
        try {
          console.log("onEndWorkTime res: ", res);

          realm.write(() => {
            if (res.id) {
              realm.create(
                "WorkTimeSchema",
                {
                  ...res,
                  _id: new BSON.ObjectId(res.id),
                },
                UpdateMode.Modified
              );
            }
            // dispatch(setActiveTaskWorker(null));
            dispatch(setWorkTime(null));
          });
        } catch (e) {
          console.log("onEndWorkTime error: ", e);
        }
      })
      .catch((e) => {
        console.log("onEndWorkTime Error", e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onStartWorkTime = async () => {
    if (!userFromStore) {
      return;
    }
    setLoading(true);

    const timeDate = dayjs(new Date()).utc();

    await onFetchWithAuth(`${hostAPI}/work_time`, {
      method: "POST",
      body: JSON.stringify({
        workerId: userFromStore.id,
        from: timeDate.format(),
        // status: _status.status,
      }),
    })
      .then((res) => res.json())
      .then((res: IWorkTime) => {
        try {
          console.log("onStartWorkTime res: ", res);

          realm.write(() => {
            if (res.id) {
              realm.create(
                "WorkTimeSchema",
                {
                  ...res,
                  _id: new BSON.ObjectId(res.id),
                },
                UpdateMode.Modified
              );
            }
          });

          dispatch(setWorkTime(res));
        } catch (e) {
          console.log("onStartWorkTime error: ", e);
        }
      })
      .catch((e) => {
        console.log("onStartWorkTime Error", e);
      })
      .finally(() => {
        setLoading(false);

        const orders = allOrders.filtered(
          "_id=$0",
          new BSON.ObjectId(activeTaskWorkerFromStore?.orderId)
        );

        if (orders.length) {
          Alert.alert(
            t("info.loadPrevTask"),
            t("info.loadPrevTaskDescription", { orderName: orders[0]?.name }),
            [
              // {
              //   text: "Ask me later",
              //   onPress: () => console.log("Ask me later pressed"),
              // },
              {
                text: t("button.no"),
                onPress: () => {
                  dispatch(setActiveTaskWorker(null));
                },
                style: "cancel",
              },
              {
                text: t("button.yes"),
                onPress: () => {
                  onStartPrevTask();
                },
              },
            ]
          );
        }
        // dispatch(setTimeWorkStart(timeDate.millisecond()));
      });
  };

  return (
    <View className="flex gap-4">
      <View className="flex gap-2 bg-white dark:bg-s-700 p-2 rounded-lg">
        {!short && workTimeFromStore !== null && (
          <View className="flex flex-row items-center gap-4">
            <View className="rounded-full">
              <SIcon
                path={"iTimer"}
                size={40}
                color={colorScheme === "dark" ? Colors.white : Colors.s[700]}
              />
            </View>
            <View className="">
              <Text className="text-s-700 dark:text-s-200 text-base">
                Общее рабочее время:
              </Text>
              {workTimeFromStore !== null && (
                <TaskWorkerNotifyTimer className="text-s-900 font-medium dark:text-white text-2xl leading-8 " />
              )}
              {/* <Text className="text-white text-lg">
                {timeWorkStartFromStore}
              </Text>
              <Text className="text-white text-lg">{timeWorkEndFromStore}</Text> */}
            </View>
          </View>
        )}
        <View>
          {workTimeFromStore !== null ? (
            <UIButton
              type="secondary"
              text={t("button.endWorkTime")}
              loading={loading}
              onPress={() => {
                Alert.alert(
                  t("info.endWorkTime"),
                  t("info.endWorkTimeDescription"),
                  [
                    {
                      text: t("button.no"),
                      onPress: () => {},
                      style: "cancel",
                    },
                    {
                      text: t("button.yes"),
                      onPress: () => {
                        onEndWorkTime();
                      },
                    },
                  ]
                );
              }}
            />
          ) : (
            <UIButton
              type="primary"
              text={t("button.startWorkTime")}
              onPress={() => {
                Alert.alert(
                  t("info.startWorkTime"),
                  t("info.startWorkTimeDescription"),
                  [
                    {
                      text: t("button.no"),
                      onPress: () => {},
                      style: "cancel",
                    },
                    {
                      text: t("button.yes"),
                      onPress: () => {
                        onStartWorkTime();
                      },
                    },
                  ]
                );
              }}
            />
          )}

          {workTimeFromStore !== null ? (
            activeTaskWorkerFromStore !== null ? (
              <View className="flex-initial pt-2">
                <TaskWorkerNotifyActiveTask />
              </View>
            ) : (
              <TaskWorkerNotifyActiveTaskNo />
            )
          ) : null}
        </View>
      </View>
    </View>
  );
}
