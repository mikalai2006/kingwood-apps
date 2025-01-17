import { View, Text } from "react-native";
import React from "react";

import { useTranslation } from "react-i18next";
import { UserSchema } from "@/schema/UserSchema";
import { useObject } from "@realm/react";
import { BSON } from "realm";

type Props = {
  userId: string | undefined;
};

const UserInfoInline = (props: Props) => {
  const { userId } = props;
  const { t } = useTranslation();

  const user = useObject(UserSchema, new BSON.ObjectId(userId));

  return user ? <Text className="text-s-500">{user.name}</Text> : null;
};

export default UserInfoInline;
