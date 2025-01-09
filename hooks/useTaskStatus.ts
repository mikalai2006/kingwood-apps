import "react-native-get-random-values";

import React, { useState } from "react";
import { hostAPI } from "@/utils/global";

import { useFetchWithAuth } from "./useFetchWithAuth";
import { useAppSelector } from "@/store/hooks";
import { activeLanguage } from "@/store/storeSlice";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "expo-router";
import { useQuery, useRealm } from "@realm/react";
import { BSON, UpdateMode } from "realm";
import { TaskStatusSchema } from "@/schema";
import { ITaskStatus } from "@/types";

export interface IUseTaskStatusProps {
  userId?: string | undefined;
  query?: string;
  id?: string[];
}

const useTaskStatus = (props: IUseTaskStatusProps) => {
  const { t } = useTranslation();

  const realm = useRealm();

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
          // await onGetNode(activeLanguageFromStore?.code || 'en', localNode)
          await onFetchWithAuth(
            `${hostAPI}/task_status?` +
              new URLSearchParams({
                lang: activeLanguageFromStore?.code || "en",
              }),
            {
              method: "GET",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
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
                // console.log("UseTaskStatus response: ", response);

                if (!response) {
                  // dispatch(setActiveNode(null));
                  // setProducts([]);
                  setTimeout(() => {
                    setLoading(false);
                  }, 300);
                  return;
                }

                const responseData: ITaskStatus[] = response.data;

                const listDataForRealm = responseData.map((x: ITaskStatus) => {
                  return {
                    ...x,
                    // _id: existLocalNode?._id || new BSON.ObjectId(),
                    _id: new BSON.ObjectId(x.id),
                    start: x.start || 0,
                    finish: x.finish || 0,
                    enabled: x.enabled || 0,
                    process: x.process || 0,
                  };
                });

                // console.log("listDataForRealm: ", listDataForRealm);
                if (listDataForRealm?.length) {
                  try {
                    realm.write(() => {
                      for (
                        let i = 0, total = listDataForRealm.length;
                        i < total;
                        i++
                      ) {
                        realm.create(
                          "TaskStatusSchema",
                          {
                            ...listDataForRealm[i],
                            enabled: listDataForRealm[i].enabled || 0,
                            start: listDataForRealm[i].enabled || 0,
                            finish: listDataForRealm[i].enabled || 0,
                            process: listDataForRealm[i].enabled || 0,
                          },
                          UpdateMode.Modified
                        );
                      }
                    });
                  } catch (e) {
                    console.log("UseTaskStatus error: ", e);
                  }
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

export default useTaskStatus;
