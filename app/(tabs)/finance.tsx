import { View, Text, Alert, ActivityIndicator } from "react-native";

import Card from "@/components/Card";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ImagePickerAsset } from "expo-image-picker";
import UIInput from "@/components/ui/UIInput";
import UIButton from "@/components/ui/UIButton";
import { ScrollView } from "react-native-gesture-handler";
import { useFetchWithAuth } from "@/hooks/useFetchWithAuth";
import { hostAPI } from "@/utils/global";
import {
  router,
  useNavigation,
  useLocalSearchParams,
  useGlobalSearchParams,
} from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import UIButtonBack from "@/components/ui/UIButtonBack";
import { SSkeleton } from "@/components/ui/SSkeleton";
import { Colors } from "@/utils/Colors";
import OrderShortInfo from "@/components/order/OrderShortInfo";
import { FinancyDay } from "@/components/financy/FinancyDay";

export default function Modal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // const { product, isLoading, setProduct } = useProduct({ id });

  const { onFetchWithAuth } = useFetchWithAuth();

  return (
    <View className="flex-1 bg-s-200 dark:bg-s-950">
      <SafeAreaView style={{ flex: 1 }}>
        {/* <View className="flex flex-row gap-2 px-4 mb-2">
          <UIButtonBack />
          <View className="flex-auto">
            {product && !isLoading && <OrderShortInfo id={id} />}
          </View>
        </View> */}
        <ScrollView className="flex-1 bg-s-200 dark:bg-s-950">
          <View className="p-4">
            <Card>
              <FinancyDay />
            </Card>
          </View>
          {/* <View className="p-4" key={product?.id}>
            {isLoading ? (
              <>
                <SSkeleton className="h-72 bg-s-100 dark:bg-s-800 flex items-center justify-center">
                  <View className="flex-1 flex-row flex-wrap p-2">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <View key={item.toString()} className="h-32 w-1/3 p-2">
                        <SSkeleton className="flex-1 bg-s-50 dark:bg-s-900" />
                      </View>
                    ))}
                  </View>
                </SSkeleton>

                <SSkeleton className="mt-4 h-24 bg-s-100 dark:bg-s-800 flex items-center justify-center">
                  <ActivityIndicator size={30} color={Colors.s[500]} />
                </SSkeleton>

                <SSkeleton className="mt-4 h-48 bg-s-100 dark:bg-s-800 flex items-center justify-center" />
              </>
            ) : (
              <>
                <Text>Create</Text>
              </>
            )}
          </View> */}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
