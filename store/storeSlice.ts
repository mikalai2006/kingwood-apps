import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import {
  AppState,
  ILang,
  IRole,
  ITaskMontajWorker,
  ITaskMontajWorkerPopulate,
  ITaskWorker,
  ITaskWorkerPopulate,
  IUser,
  IWorkTime,
  TTokenInput,
} from "@/types";

const initialState: AppState = {
  modeTheme: "light",
  tokens: null,
  langCode: "",
  activeLanguage: null,
  languages: [],
  user: null,
  role: {},
  users: {},
  activeTaskWorker: null,
  workTime: null,
};

// Приведенная ниже функция называется thunk и позволяет нам выполнять асинхронную логику. Это
// можно отправить как обычное действие: `dispatch(incrementAsync(10))`. Этот
// вызовет преобразователь с функцией `dispatch` в качестве первого аргумента. Асинхронный
// затем код может быть выполнен и другие действия могут быть отправлены. Преобразователи
// обычно используется для выполнения асинхронных запросов.
export const incrementAsync = createAsyncThunk(
  "counter/fetchCount",
  async (amount: number) => {
    const response = await fetchCount(amount);
    // The value we return becomes the `fulfilled` action payload
    return response.data;
  }
);
export function fetchCount(amount = 1) {
  return new Promise<{ data: number }>((resolve) =>
    setTimeout(() => resolve({ data: amount }), 500)
  );
}

export const storeSlice = createSlice({
  name: "store",
  initialState,
  // Поле `reducers` позволяет нам определять редьюсеры и генерировать связанные действия
  reducers: {
    // Используйте тип PayloadAction для объявления содержимого `action.payload`
    setTokens: (state, action: PayloadAction<TTokenInput | null>) => {
      if (action.payload) {
        state.tokens = Object.assign({}, state.tokens, action.payload);
      } else {
        state.tokens = null;
      }
      // if (!state.tokens.access_token || state.tokens.access_token === '') {
      //     state.tokens.expires_in =
      // }
      // console.log("setTokens:::", state.tokens);
    },
    setUser: (state, action: PayloadAction<IUser | null>) => {
      // console.log('setUser: ', JSON.stringify(action.payload)); // JSON.stringify(action.payload)
      state.user = action.payload ? { ...action.payload } : null;
    },
    // setFeature: (state, action: PayloadAction<IFeature | null>) => {
    //     console.log('setFeature: ', JSON.stringify(action?.payload?.osmId));
    //     state.feature = action.payload ? {...action.payload} : action.payload;
    // },
    setModeTheme: (
      state,
      action: PayloadAction<"light" | "dark" | "system">
    ) => {
      // console.log('setDark: ', action.payload);
      state.modeTheme = action.payload;
    },
    setLangCode: (state, action: PayloadAction<string>) => {
      // console.log('setLangCode:::::', state.langCode, action.payload);
      let activeLanguage = state.languages.find(
        (x) => x.code === action.payload
      );
      if (!activeLanguage) {
        activeLanguage = state.languages.find((x) => x.code === "en");
        state.langCode = "en";
      } else {
        state.langCode = action.payload;
      }

      if (activeLanguage) {
        state.activeLanguage = activeLanguage;
      }
      // console.log('activeLanguage', state.activeLanguage);
    },
    setLanguages: (state, action: PayloadAction<ILang[]>) => {
      // console.log('setLanguages:::::::::::::::::::::', action.payload); //action.payload
      state.languages = action.payload;
    },
    setRole: (state, action: PayloadAction<IRole[]>) => {
      // console.log('setRole', action.payload);
      state.role = Object.fromEntries(action.payload.map((x) => [x.id, x]));
    },
    setUsers: (state, action: PayloadAction<IUser[]>) => {
      // console.log('setRole', action.payload);
      state.users = Object.fromEntries(action.payload.map((x) => [x.id, x]));
    },
    setActiveTaskWorker: (
      state,
      action: PayloadAction<ITaskWorkerPopulate | null>
    ) => {
      console.log("setActiveTask", action.payload);
      state.activeTaskWorker = action.payload;
    },
    setWorkTime: (state, action: PayloadAction<IWorkTime | null>) => {
      // console.log("setWorkTimeId: ", action.payload);
      state.workTime = action.payload;
    },
  },
  // Поле `extraReducers` позволяет срезу обрабатывать действия, определенные в другом месте,
  // включая действия, сгенерированные createAsyncThunk или другими слайсами.
  // extraReducers: builder => {
  //     // builder
  //     //   .addCase(incrementAsync.pending, state => {
  //     //     state.status = 'loading';
  //     //   })
  //     //   .addCase(incrementAsync.fulfilled, (state, action) => {
  //     //     state.status = 'idle';
  //     //     state.value += action.payload;
  //     //   })
  //     //   .addCase(incrementAsync.rejected, state => {
  //     //     state.status = 'failed';
  //     //   });
  // },
});

export const {
  setModeTheme,
  setTokens,
  setLangCode,
  setUser,
  setLanguages,
  setRole,
  setUsers,
  setActiveTaskWorker,
  setWorkTime,
} = storeSlice.actions;
// Функция ниже называется селектором и позволяет нам выбрать значение из
// штат. Селекторы также могут быть определены встроенными, где они используются вместо
// в файле среза. Например: `useSelector((состояние: RootState) => состояние.счетчик.значение)`
export const modeTheme = (state: RootState) => state.store.modeTheme;
export const tokens = (state: RootState) => state.store.tokens;
export const langCode = (state: RootState) => state.store.langCode;
export const activeLanguage = (state: RootState) => state.store.activeLanguage;
export const languages = (state: RootState) => state.store.languages;
export const user = (state: RootState) => state.store.user;
export const role = (state: RootState) => state.store.role;
export const users = (state: RootState) => state.store.users;
export const activeTaskWorker = (state: RootState) =>
  state.store.activeTaskWorker;
export const workTime = (state: RootState) => state.store.workTime;

export default storeSlice.reducer;
