import "react-native-get-random-values";

import React, { useState } from "react";
import { hostAPI } from "@/utils/global";

import { useFetchWithAuth } from "./useFetchWithAuth";
import { useAppSelector } from "@/store/hooks";
import { activeLanguage } from "@/store/storeSlice";
import { useTranslation } from "react-i18next";
import { IFilterSort, IOffer, IResponseData, ISubscribe } from "@/types";
import { useFocusEffect } from "expo-router";
import { useQuery, useRealm } from "@realm/react";
import { BSON, UpdateMode } from "realm";
import { UserSchema } from "@/schema/UserSchema";
import { OfferSchema } from "@/schema/OfferSchema";
import { SubscribeSchema } from "@/schema/SubscribeSchema";

export interface IuseSubscribeProps {
  userId?: string | undefined;
  subUserId?: string[];
  sort?: IFilterSort;
}

const useSubscribe = (props: IuseSubscribeProps) => {
  const { t } = useTranslation();

  const { userId, sort, subUserId } = props;

  let query = "";
  if (userId) {
    query += `userId == '${userId}' `;
  }
  if (subUserId?.length) {
    const idsQuery = subUserId.map((x) => `'${x}'`).join(", ");
    query += `subUserId IN {${idsQuery}}`;
  }
  const subscribes = useQuery(SubscribeSchema, (items) =>
    items.filtered(query)
  );

  const realm = useRealm();

  const { onFetchWithAuth } = useFetchWithAuth();

  const activeLanguageFromStore = useAppSelector(activeLanguage);

  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      let ignore = false;
      const onFindSubscribes = async () => {
        try {
          await onFetchWithAuth(
            `${hostAPI}/subscribe/find?` +
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
                userId: userId || undefined,
                subUserId: subUserId?.length ? subUserId : undefined,
                sort: sort
                  ? [
                      {
                        key: sort.key,
                        value: sort.value,
                      },
                    ]
                  : [],
              }),
            }
          )
            .then((r) => r.json())
            .then((response: IResponseData<ISubscribe>) => {
              if (!ignore) {
                // console.log("useSubscribe response: ", response);

                const responseData = response;
                if (!responseData) {
                  // dispatch(setActiveNode(null));
                  // setProducts([]);
                  setTimeout(() => {
                    setLoading(false);
                  }, 300);
                  return;
                }

                const responseItems = responseData.data;

                const listDataForRealm = responseItems.map((x) => {
                  return {
                    ...x,
                    _id: new BSON.ObjectId(x.id),
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
                          "SubscribeSchema",
                          {
                            ...listDataForRealm[i],
                          },
                          UpdateMode.Modified
                        );
                      }

                      // for (
                      //   let i = 0, total = responseItems.length;
                      //   i < total;
                      //   i++
                      // ) {
                      //   realm.create(
                      //     "UserSchema",
                      //     {
                      //       ...responseItems[i].user,
                      //       _id: new BSON.ObjectId(responseItems[i].user.id),
                      //     },
                      //     UpdateMode.Modified
                      //   );
                      // }
                    } catch (e) {
                      console.log("useSubscribe error: ", e);
                    }
                  });
                }
                // setProducts(responseProductsData);

                setTimeout(() => {
                  setLoading(false);
                }, 100);
                // console.log('activeMarker=', response);
                // dispatch(setActiveNode(responseNode));
              }
            })
            .catch((e) => {
              setTimeout(() => {
                setLoading(false);
              }, 300);
              throw e;
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
        onFindSubscribes();
      }

      return () => {
        ignore = true;
      };
    }, []) //productId, userId, sort
  );

  return {
    isLoading,
    subscribes: subscribes || [],
    error,
  };
};

export default useSubscribe;
