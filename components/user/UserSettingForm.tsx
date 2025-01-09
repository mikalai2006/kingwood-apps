import { Text, View } from "react-native";
import React, { useMemo, useState } from "react";

import { setTokens, tokens, user } from "@/store/storeSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useTranslation } from "react-i18next";
import UIButton from "../ui/UIButton";
import { hostAPI } from "@/utils/global";
import useAuth from "@/hooks/useAuth";
import Card from "../Card";
import UIInput from "../ui/UIInput";

const UserSettingForm = () => {
  const { t } = useTranslation();

  const { onGetIam, onSyncToken: onCheckAuth } = useAuth();

  const dispatch = useAppDispatch();
  const userFromStore = useAppSelector(user);
  const tokensFromStore = useAppSelector(tokens);

  // const [login, setLogin] = useState(userFromStore?.login);
  const [myName, setMyName] = useState(userFromStore?.name);
  const [myBirthday, setMyBirthday] = useState(userFromStore?.birthday);
  const [myPhone, setMyPhone] = useState(userFromStore?.phone);
  const disabledSave = useMemo(
    () =>
      (userFromStore?.name === myName || myName === "") &&
      userFromStore?.birthday === myBirthday &&
      userFromStore?.phone === myPhone,
    [
      myName,
      userFromStore?.name,
      myBirthday,
      userFromStore?.birthday,
      myPhone,
      userFromStore?.phone,
    ]
  );
  const [loading, setLoading] = useState(false);
  const createFormData = (body: any = {}) => {
    const data = new FormData();

    Object.keys(body).forEach((key) => {
      data.append(key, body[key]);
    });

    return data;
  };
  const onPatchUser = async () => {
    setLoading(true);

    await onCheckAuth();

    if (!tokensFromStore) {
      return;
    }

    return await fetch(hostAPI + `/user/${userFromStore?.id}`, {
      method: "PATCH",
      headers: {
        "Access-Control-Allow-Origin-Type": "*",
        Authorization: `Bearer ${tokensFromStore.access_token}`,
      },
      body: createFormData({
        name: myName,
        birthday: myBirthday,
        phone: myPhone,
      }),
    })
      .then((r) => r.json())
      .then(async (response) => {
        if (response.message && response?.code === 401) {
          dispatch(setTokens({ access_token: "" }));
        }

        if (response.id) {
          const result = await onGetIam();
          // console.log("result: ", result, userFromStore);

          setMyName(result?.name);
          return response;
        }
      })
      .catch((e) => {
        console.log("e=", e);

        throw e;
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // const customMask = (text: string) => {
  //   let newText = "";
  //   let mask = "(999) 999 9999";

  //   for (let i = 0, j = 0; i < text.length; i++) {
  //     if (mask[j] === "9") {
  //       if (/\d/.test(text[i])) {
  //         newText += text[i];
  //         j++;
  //       }
  //     } else {
  //       newText += mask[j];
  //       j++;
  //     }
  //   }

  //   setMyBirthday(newText);
  // };

  return (
    <>
      <Card>
        {/* <Text>
          {JSON.stringify({ b1: userFromStore?.birthday, myBirthday })}
        </Text> */}
        <UIInput
          value={myName}
          onChangeText={setMyName}
          keyboardType="default"
          title={t("fio")}
          editable={false}
        />

        <View className="pt-8">
          <UIInput
            value={myBirthday}
            onChangeText={setMyBirthday}
            keyboardType="numeric"
            title={t("birthday")}
          />
        </View>

        <View className="pt-8">
          <UIInput
            value={myPhone}
            onChangeText={setMyPhone}
            keyboardType="numeric"
            title={t("phone")}
          />
        </View>
        {/* <View className="mt-4">
                    <UIInput title="Логин" text={userFromStore?.login} />
                  </View> */}
        <View className="mt-4">
          <UIButton
            type="primary"
            text="Сохранить изменения"
            loading={loading}
            disabled={disabledSave}
            onPress={onPatchUser}
          />
        </View>
      </Card>
    </>
  );
};

export default UserSettingForm;
