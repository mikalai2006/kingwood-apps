import Realm, { BSON, ObjectSchema } from "realm";
export class OrderSchema extends Realm.Object<OrderSchema> {
  _id!: BSON.ObjectId;
  userId!: string;
  number!: number;
  name!: string;
  description?: string;
  constructorId!: string;
  objectId!: string;
  term?: string;
  priority?: number;

  stolyarComplete?: number;
  malyarComplete?: number;
  goComplete?: number;
  dateOtgruzka?: string;
  montajComplete?: number;

  createdAt!: string;
  updatedAt!: string;

  static schema: ObjectSchema = {
    name: "OrderSchema",
    properties: {
      _id: "objectId",
      userId: "string",
      number: "int",
      name: "string",
      description: "string?",
      constructorId: "string",
      objectId: "string",
      term: "string?",
      priority: "int?",

      stolyarComplete: "int?",
      malyarComplete: "int?",
      goComplete: "int?",
      dateOtgruzka: "string?",
      montajComplete: "int?",

      createdAt: { type: "string", optional: true },
      updatedAt: { type: "string", optional: true },
    },
    primaryKey: "_id",
  };
}

export type OrderSchemaInput = {
  [Property in keyof OrderSchema]?: OrderSchema[Property];
};
