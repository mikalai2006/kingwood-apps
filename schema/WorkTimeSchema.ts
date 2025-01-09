import Realm, { BSON, ObjectSchema } from "realm";

export class WorkTimeSchema extends Realm.Object<WorkTimeSchema> {
  _id!: BSON.ObjectId;
  userId!: string;
  // orderId!: string;
  // taskId!: string;
  workerId!: string;
  status?: string;
  from!: string;
  to!: string;
  createdAt!: string;
  updatedAt!: string;

  static schema: ObjectSchema = {
    name: "WorkTimeSchema",
    properties: {
      _id: "objectId",
      userId: "string",
      // orderId: "string",
      // taskId: "string",
      workerId: "string",
      status: "string?",
      from: "string",
      to: "string",
      createdAt: { type: "string", optional: true },
      updatedAt: { type: "string", optional: true },
    },
    primaryKey: "_id",
  };
}

export type WorkTimeSchemaInput = {
  [Property in keyof WorkTimeSchema]?: WorkTimeSchema[Property];
};
