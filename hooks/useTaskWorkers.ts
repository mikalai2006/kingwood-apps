import "react-native-get-random-values";

import React, { useState } from "react";
import { hostAPI } from "@/utils/global";

import { useFetchWithAuth } from "./useFetchWithAuth";
import { useAppSelector } from "@/store/hooks";
import { activeLanguage } from "@/store/storeSlice";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "expo-router";
import { useRealm } from "@realm/react";
import { BSON, UpdateMode } from "realm";
import { ITaskWorker, ITaskWorkerPopulate } from "@/types";

export interface IUseTaskWorkersProps {
  query?: string;
  id?: string[];
  objectId?: string[];
  orderId?: string[];
  taskId?: string[];
  workerId?: string[];
  $limit?: number;
}

const useTaskWorkers = (props: IUseTaskWorkersProps) => {
  const { t } = useTranslation();

  const realm = useRealm();

  const { query, workerId, $limit } = props;

  const { onFetchWithAuth } = useFetchWithAuth();

  const activeLanguageFromStore = useAppSelector(activeLanguage);

  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState<ITaskWorker[]>([]);
  // const [products, setProducts] = useState<IProduct[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      let ignore = false;
      const onFindItems = async () => {
        try {
          console.log("props: ", props);

          // if (!workerId) {
          //   return;
          // }
          // await onGetNode(activeLanguageFromStore?.code || 'en', localNode)
          await onFetchWithAuth(
            `${hostAPI}/task_worker/populate?` +
              new URLSearchParams({
                lang: activeLanguageFromStore?.code || "en",
              }),
            {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ...props,
              }),
              // node(id: "${featureFromStore?.id}") {
              // body: JSON.stringify({
              //   userId: userId || undefined,
              //   query: query || undefined,
              //   id,
              // }),
            }
          )
            .then((r) => r.json())
            .then((response) => {
              if (!ignore) {
                console.log("useTaskWorkers response: ", response.data.length);

                const responseTaskWorkersData: ITaskWorker[] = response.data;
                if (!responseTaskWorkersData) {
                  // dispatch(setActiveNode(null));
                  // setProducts([]);
                  setTimeout(() => {
                    setLoading(false);
                  }, 300);
                  return;
                }

                setItems(responseTaskWorkersData);

                const listDataForRealm = responseTaskWorkersData.map(
                  (x: ITaskWorkerPopulate) => {
                    return {
                      ...x,
                      // _id: existLocalNode?._id || new BSON.ObjectId(),
                      sortOrder: x.sortOrder || 0,
                      _id: new BSON.ObjectId(x.id),
                      task: {
                        ...x.task,
                        _id: new BSON.ObjectId(x.task.id),
                      },
                      taskStatus: {
                        ...x.taskStatus,
                        _id: new BSON.ObjectId(x.taskStatus.id),
                        start: x.taskStatus.start || 0,
                        finish: x.taskStatus.finish || 0,
                        enabled: x.taskStatus.enabled || 0,
                        process: x.taskStatus.process || 0,
                      },
                      order: {
                        ...x.order,
                        _id: new BSON.ObjectId(x.order.id),
                      },
                      object: {
                        ...x.object,
                        _id: new BSON.ObjectId(x.object?.id),
                      },
                    };
                  }
                );

                // console.log("listDataForRealm: ", listDataForRealm);
                if (listDataForRealm.length) {
                  realm.write(() => {
                    try {
                      for (
                        let i = 0, total = listDataForRealm.length;
                        i < total;
                        i++
                      ) {
                        realm.create(
                          "TaskWorkerSchema",
                          listDataForRealm[i],
                          UpdateMode.Modified
                        );
                        if (listDataForRealm[i].task) {
                          realm.create(
                            "TaskSchema",
                            listDataForRealm[i].task,
                            UpdateMode.Modified
                          );
                        }
                        if (listDataForRealm[i].taskStatus) {
                          realm.create(
                            "TaskStatusSchema",
                            {
                              ...listDataForRealm[i].taskStatus,
                              enabled:
                                listDataForRealm[i].taskStatus.enabled || 0,
                              start:
                                listDataForRealm[i].taskStatus.enabled || 0,
                              finish:
                                listDataForRealm[i].taskStatus.enabled || 0,
                              process:
                                listDataForRealm[i].taskStatus.enabled || 0,
                            },
                            UpdateMode.Modified
                          );
                        }
                        if (listDataForRealm[i].order) {
                          realm.create(
                            "OrderSchema",
                            listDataForRealm[i].order,
                            UpdateMode.Modified
                          );
                        }
                        if (listDataForRealm[i].object) {
                          realm.create(
                            "ObjectsSchema",
                            listDataForRealm[i].object,
                            UpdateMode.Modified
                          );
                        }
                      }
                    } catch (e) {
                      console.log("useTaskWorkers error: ", e);
                    }
                  });
                }
                // console.log("productsFromRealm: ", localOffersMap);
                // setProducts(responseProductsData);

                // console.log('activeMarker=', response);
                // dispatch(setActiveNode(responseNode));
              }
            })
            .catch((e) => {
              // setTimeout(() => {
              //   setLoading(false);
              // }, 300);
              throw e;
            })
            .finally(() => {
              setTimeout(() => {
                setLoading(false);
              }, 300);
            });
        } catch (e: any) {
          // ToastAndroid.showWithGravity(
          //     `${t('general:alertAdviceTitle')}: ${e?.message}`,
          //     ToastAndroid.LONG,
          //     ToastAndroid.TOP,
          // );
          setError(e.message);
          // console.log('UseNode error: ', e?.message);
        }
      };

      if (!ignore) {
        setLoading(true);
        // setTimeout(onGetNodeInfo, 100);
        onFindItems();
      }

      return () => {
        ignore = true;
      };
    }, [])
  );

  return {
    taskWorkers: items,
    isLoading,
    error,
  };
};

export default useTaskWorkers;
