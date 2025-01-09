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
import { IObject } from "@/types";
import { ObjectsSchema } from "@/schema/ObjectsSchema";

export interface IuseObjectsProps {
  userId?: string;
  query?: string;
  id?: string;
}

const useObjects = (props: IuseObjectsProps) => {
  const { t } = useTranslation();

  const realm = useRealm();

  const { query, id } = props;

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
            `${hostAPI}/object/find?` +
              new URLSearchParams({
                lang: activeLanguageFromStore?.code || "en",
              }),
            {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              // node(id: "${featureFromStore?.id}") {
              body: JSON.stringify({
                query: query || undefined,
                id,
              }),
            }
          )
            .then((r) => r.json())
            .then((response) => {
              if (!ignore) {
                // console.log("useObjects response: ", response);

                if (!response) {
                  // dispatch(setActiveNode(null));
                  setTimeout(() => {
                    setLoading(false);
                  }, 300);
                  return;
                }

                const responseData: IObject[] = response.data;

                const listDataForRealm = responseData.map((x: IObject) => {
                  return {
                    ...x,
                    // _id: existLocalNode?._id || new BSON.ObjectId(),
                    _id: new BSON.ObjectId(x.id),
                  };
                });

                // console.log("listDataForRealm: ", listDataForRealm);
                if (listDataForRealm?.length) {
                  realm.write(() => {
                    try {
                      for (
                        let i = 0, total = listDataForRealm.length;
                        i < total;
                        i++
                      ) {
                        realm.create(
                          "ObjectsSchema",
                          listDataForRealm[i],
                          UpdateMode.Modified
                        );
                      }
                    } catch (e) {
                      console.log("useObjects error: ", e);
                    }
                  });
                }
                // console.log("listDataForRealm: ", listDataForRealm);
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

export default useObjects;
