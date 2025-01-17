import * as icons from "@/utils/icons";
import { NetInfoState } from "@react-native-community/netinfo";

export interface IWsMessage {
  type: string;
  sender: string;
  method: "CREATE" | "PATCH" | "DELETE";
  recipient: string;
  content: any;
  id: string;
  service: string;
}

export interface ILang {
  id: string;
  locale: string;
  code: string;
  name: string;
  localization: {
    [key: string]: any;
  };
  flag: string;
  publish: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: string;
}

export interface ICurrency {
  id: string;
  status: boolean;
  title: string;
  code: string;
  symbolLeft: string;
  symbolRight: string;
  decimalPlaces: number;
  value: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ITokens {
  access_token: string | null;
  refresh_token: string | null;
  expires_in: number;
  expires_in_r: number;
}
export type TTokenInput = {
  [Property in keyof ITokens]?: ITokens[Property];
};
export type ITokenResponse = {
  token: string;
  rt: string;
  exp: number;
  expr: number;
};

export interface IResponseData<T> {
  data: T[];
  limit: number;
  total: number;
  skip: number;
}

// export interface IUserStat {
//   addProduct: number;
//   takeProduct: number;
//   giveProduct: number;
//   addOffer: number;
//   takeOffer: number;
//   addMessage: number;
//   takeMessage: number;
//   addReview: number;
//   takeReview: number;
//   warning: number;
//   request: number;
//   subscribe: number;
//   subscriber: number;
//   lastRequest: Date;
// }

export interface IImage {
  id: string;
  userId: string;
  service: string;
  serviceId: string;
  ext: string;
  path: string;
  dir: string;
  user: IUser;
  createdAt: string;
  updatedAt: string;
}

export interface IOrder {
  id: string;
  userId: string;
  name: string;
  description: string;
  number: number;
  constructorId: string;
  term: string;
  object: string;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export type IOrderInput = {
  [Property in keyof IOrder]?: IOrder[Property];
};

export interface IPost {
  id: string;
  name: string;
  description: string;
  props: any;
  color: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export type IPostInput = {
  [Property in keyof IPost]?: IPost[Property];
};

export interface IObject {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export type IObjectInput = {
  [Property in keyof IObject]?: IObject[Property];
};
export interface IRole {
  id: string;
  name: string;
  code: string;
  value: string[];
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export type IRoleInput = {
  [Property in keyof IRole]?: IRole[Property];
};

export interface ITask {
  id: string;
  userId: string;
  objectId: string;
  orderId: string;
  operationId: string;
  name: string;
  sortOrder: number;
  statusId: string;
  status: string;
  startAt: string;
  active: number;
  typeGo: string;
  from: string;
  to: string;
  autoCheck: number;

  workers: ITaskWorker[];
  object: IObject;
  operation: IOperation;
  order: IOrder;

  createdAt: Date;
  updatedAt: Date;
}

export type ITaskInput = {
  [Property in keyof ITask]?: ITask[Property];
};

export interface ITaskStatus {
  id: string;
  userId: string;
  name: string;
  description: string;
  color: string;
  enabled: string;
  icon: string;
  animate?: string;
  start?: number;
  finish?: number;
  process?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ITaskStatusInput = {
  [Property in keyof ITaskStatus]?: ITaskStatus[Property];
};

export interface INotify {
  id: string;
  userId: string;
  userTo: string;
  message: string;
  status: number;
  images: string[];

  user?: IUser;
  recepient?: IUser;

  readAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskWorker {
  id: string;
  userId: string;
  objectId: string;
  orderId: string;
  taskId: string;
  workerId: string;
  sortOrder: number;
  statusId: string;
  status: string;
  from: string;
  to: string;
  typeGo: string;

  task: ITask;
  taskStatus: ITaskStatus;
  order: IOrder;
  worker: IUser;
  object: IObject;

  createdAt: Date;
  updatedAt: Date;
}

export type ITaskWorkerPopulate = Partial<ITaskWorker> & {
  taskStatus: ITaskStatus;
  task: ITask;
  order: IOrder;
};

export type ITaskWorkerInput = {
  [Property in keyof ITaskWorker]?: ITaskWorker[Property];
};

export interface ITaskMontaj {
  id: string;
  userId: string;
  objectId: string;
  // operationId: string;
  name: string;
  sortOrder: number;
  statusId: string;
  status: string;
  typeGo: string;
  from: string;
  to: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ITaskMontajPopulate = Partial<ITaskMontaj> & {
  object: IObject;
};

export type ITaskMontajInput = {
  [Property in keyof ITaskMontaj]?: ITaskMontaj[Property];
};

export interface ITaskMontajWorker {
  id: string;
  userId: string;
  objectId: string;
  taskId: string;
  workerId: string;
  sortOrder: number;
  statusId: string;
  status: string;
  from: string;
  to: string;
  typeGo: string;

  createdAt: Date;
  updatedAt: Date;
}

export type ITaskMontajWorkerPopulate = Partial<ITaskMontajWorker> & {
  taskMontaj: ITaskMontaj;
  taskStatus: ITaskStatus;
  worker: IUser;
  object: IObject;
};

export type ITaskMontajWorkerInput = {
  [Property in keyof ITaskMontajWorker]?: ITaskMontajWorker[Property];
};

export interface IUser {
  id: string;
  userId: string;
  name: string;
  phone: string;
  online: boolean;
  hidden: number;
  birthday: string;
  roleId: string;
  roleObject: IRole;
  postId: string;
  postObject: IPost;
  typeWork: string[];
  typePay: number;
  oklad: number;
  // workes: number;
  post: IPost;
  images: IImage[];
  lastTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type IUserInput = {
  [Property in keyof IUser]?: IUser[Property];
};

export interface IFinancyFilter {
  year: number;
  month: number;
  monthText: string;
  monthIndex: number;
}

export type TNetInfoState = {
  [Property in keyof NetInfoState]?: NetInfoState[Property];
};

export interface IWorkHistory {
  id: string;
  userId: string;
  objectId: string;
  orderId: string;
  taskId: string;
  workerId: string;
  operationId: string;
  status: string;
  from: string;
  to: string;
  createdAt: string;
  updatedAt: string;
}

export interface IWorkTime {
  id: string;
  userId: string;
  // orderId: string;
  // taskId: string;
  workerId: string;
  status: string;
  date: string;
  from: string;
  to: string;
  oklad: number;
  createdAt: string;
  updatedAt: string;
}

export type IWorkTimeInput = {
  [Property in keyof IWorkTime]?: IWorkTime[Property];
};

export interface IOperation {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export type IOperationInput = {
  [Property in keyof IOperation]?: IOperation[Property];
};

export interface AppState {
  modeTheme: "dark" | "light" | "system";
  tokens: ITokens | null;
  langCode: string;
  activeLanguage: null | ILang;
  languages: ILang[];
  user: IUser | null;
  role: {
    [key: string]: IRole;
  };
  users: {
    [key: string]: IUser;
  };
  activeTaskWorker: ITaskWorkerPopulate | null;
  workTime: IWorkTime | null;
  workHistory: IWorkHistory | null;
  financyFilter: IFinancyFilter;
}
