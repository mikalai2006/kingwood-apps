import { OrderSchema, TaskStatusSchema } from "@/schema";
import { useQuery, useRealm } from "@realm/react";
import { useState } from "react";
import { useFetchWithAuth } from "./useFetchWithAuth";
import { hostAPI } from "@/utils/global";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  activeTaskWorker,
  setActiveTaskWorker,
  setWorkTime,
  user,
  workTime,
} from "@/store/storeSlice";
import { ITaskWorker, IWorkTime } from "@/types";
import { BSON, UpdateMode } from "realm";
import dayjs from "@/utils/dayjs";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";

export const useTaskWorkerUtils = () => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const userFromStore = useAppSelector(user);

  const workTimeFromStore = useAppSelector(workTime);

  const activeTaskWorkerFromStore = useAppSelector(activeTaskWorker);

  const realm = useRealm();

  const allOrders = useQuery(OrderSchema);

  const allTaskStatus = useQuery(TaskStatusSchema);

  const { onFetchWithAuth } = useFetchWithAuth();

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

          // _status.status && onWriteWorkHistory(_status.status, res);
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

              // _status.status && onWriteWorkHistory(_status.status, res);
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

    await onFetchWithAuth(`${hostAPI}/work_time/${workTimeFromStore.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        // statusId: "6749ffe3d6b4324345382aed",
        to: timeDate.format(),
        status: 1,
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
        oklad: userFromStore.oklad,
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

  return {
    loading,
    onStartPrevTask,
    onStartWorkTime,
    onEndWorkTime,
  };
};
