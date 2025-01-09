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
import { ITaskMontajWorkerPopulate } from "@/types";

export interface IUseTaskMontajWorkersProps {
  // query?: string;
  id?: string[];
  objectId?: string[];
  taskId?: string[];
  workerId?: string[];
  from?: string;
  to?: string;
  $limit?: number;
}

const useTaskMontajWorkers = (props: IUseTaskMontajWorkersProps) => {
  const { t } = useTranslation();

  const realm = useRealm();

  const { onFetchWithAuth } = useFetchWithAuth();

  const activeLanguageFromStore = useAppSelector(activeLanguage);

  const [isLoading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      let ignore = false;
      const onFindItems = async () => {
        try {
          console.log("useTaskMontajWorkers > props: ", props);

          await onFetchWithAuth(
            `${hostAPI}/task_montaj_worker/populate?` +
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
            }
          )
            .then((r) => r.json())
            .then((response) => {
              if (!ignore) {
                console.log(
                  "useTaskMontajWorkers response: ",
                  response.data?.length
                );

                if (!response) {
                  setTimeout(() => {
                    setLoading(false);
                  }, 300);
                  return;
                }

                const responseTaskWorkersData: ITaskMontajWorkerPopulate[] =
                  response.data;

                const listDataForRealm = responseTaskWorkersData.map(
                  (x: ITaskMontajWorkerPopulate) => {
                    return {
                      ...x,
                      sortOrder: x.sortOrder || 0,
                      _id: new BSON.ObjectId(x.id),
                      taskMontaj: {
                        ...x.taskMontaj,
                        _id: new BSON.ObjectId(x.taskMontaj.id),
                      },
                      taskStatus: {
                        ...x.taskStatus,
                        _id: new BSON.ObjectId(x.taskStatus.id),
                        start: x.taskStatus.start || 0,
                        finish: x.taskStatus.finish || 0,
                        enabled: x.taskStatus.enabled || 0,
                        process: x.taskStatus.process || 0,
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
                          "TaskMontajWorkerSchema",
                          listDataForRealm[i],
                          UpdateMode.Modified
                        );
                        if (listDataForRealm[i].taskMontaj) {
                          realm.create(
                            "TaskMontajSchema",
                            listDataForRealm[i].taskMontaj,
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
                      }
                    } catch (e) {
                      console.log("useTaskMontajWorkers error: ", e);
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
    isLoading,
    error,
  };
};

export default useTaskMontajWorkers;
