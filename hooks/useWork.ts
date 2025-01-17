import { ITaskWorker, IWorkHistory } from "@/types";
import { hostAPI } from "@/utils/global";
import { useFetchWithAuth } from "./useFetchWithAuth";
import dayjs from "@/utils/dayjs";
import { useRealm } from "@realm/react";
import { BSON, UpdateMode } from "realm";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setWorkHistory, workHistory } from "@/store/storeSlice";

const useWork = () => {
  const realm = useRealm();

  const dispatch = useAppDispatch();

  const workHistoryFromStore = useAppSelector(workHistory);

  const { onFetchWithAuth } = useFetchWithAuth();

  const onWriteWorkHistory = async (
    statusName: string,
    taskWorker: ITaskWorker
  ) => {
    if (["process"].includes(statusName)) {
      await onFetchWithAuth(`${hostAPI}/work_history`, {
        method: "POST",
        body: JSON.stringify({
          status: 0,
          from: dayjs().utc().format(),
          objectId: taskWorker?.objectId,
          orderId: taskWorker?.orderId,
          taskId: taskWorker?.taskId,
          workerId: taskWorker?.workerId,
          operationId: taskWorker?.task.operationId,
        }),
      })
        .then((res) => res.json())
        .then((res: IWorkHistory) => {
          realm.write(() => {
            try {
              realm.create(
                "WorkHistorySchema",
                {
                  ...res,
                  _id: new BSON.ObjectId(res.id),
                },
                UpdateMode.Modified
              );
            } catch (e) {
              console.log("onWriteWorkHistory error: ", e);
            }
          });

          dispatch(setWorkHistory(res));
        })
        .catch((e) => {
          console.log("onWriteWorkHistory Error", e);
        });
    } else {
      await onFetchWithAuth(
        `${hostAPI}/work_history/${workHistoryFromStore?.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: 1,
            to: dayjs().utc().format(),
          }),
        }
      )
        .then((res) => res.json())
        .then((res: IWorkHistory) => {
          realm.write(() => {
            try {
              realm.create(
                "WorkHistorySchema",
                {
                  ...res,
                  _id: new BSON.ObjectId(res.id),
                },
                UpdateMode.Modified
              );

              dispatch(setWorkHistory(null));
            } catch (e) {
              console.log("onWriteWorkHistory error: ", e);
            }
          });
        })
        .catch((e) => {
          console.log("onWriteWorkHistory Error", e);
        });
    }
  };

  return {
    onWriteWorkHistory,
  };
};

export { useWork };
