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
import { ITask } from "@/types";

export interface IUseTaskProps {
  id?: string[];
  orderId?: string[];
  objectId?: string[];
}

const useTask = (props: IUseTaskProps) => {
  const { t } = useTranslation();

  const realm = useRealm();

  const { id, orderId, objectId } = props;

  const { onFetchWithAuth } = useFetchWithAuth();

  const activeLanguageFromStore = useAppSelector(activeLanguage);

  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [products, setProducts] = useState<IProduct[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      let ignore = false;
      const onFindItems = async () => {
        try {
          console.log("useTask: ", props);

          // if (!id) {
          //   return;
          // }

          await onFetchWithAuth(
            `${hostAPI}/task/populate?` +
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
                // console.log("UseTask response: ", response);

                if (!response) {
                  // dispatch(setActiveNode(null));
                  // setProducts([]);
                  setTimeout(() => {
                    setLoading(false);
                  }, 300);
                  return;
                }

                const responseData: ITask[] = response.data;

                const listDataForRealm = responseData.map((x: ITask) => {
                  return {
                    ...x,
                    _id: new BSON.ObjectId(x.id),
                    sortOrder: x.sortOrder || 0,
                  };
                });

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
                          "TaskSchema",
                          listDataForRealm[i],
                          UpdateMode.Modified
                        );

                        if (listDataForRealm[i].object) {
                          realm.create(
                            "ObjectsSchema",
                            {
                              ...listDataForRealm[i].object,
                              _id: new BSON.ObjectId(
                                listDataForRealm[i].objectId
                              ),
                            },
                            UpdateMode.Modified
                          );
                        }

                        if (listDataForRealm[i].workers) {
                          for (
                            let j = 0,
                              total = listDataForRealm[i].workers.length;
                            j < total;
                            j++
                          ) {
                            realm.create(
                              "TaskWorkerSchema",
                              {
                                ...listDataForRealm[i].workers[j],
                                _id: new BSON.ObjectId(
                                  listDataForRealm[i].workers[j].id
                                ),
                              },
                              UpdateMode.Modified
                            );

                            if (listDataForRealm[i].workers[j].worker) {
                              realm.create(
                                "UserSchema",
                                {
                                  ...listDataForRealm[i].workers[j].worker,
                                  _id: new BSON.ObjectId(
                                    listDataForRealm[i].workers[j].worker.id
                                  ),
                                },
                                UpdateMode.Modified
                              );
                            }
                          }
                        }
                      }
                    } catch (e) {
                      console.log("UseTask error: ", e);
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

export default useTask;
