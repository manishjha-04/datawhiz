import { configureStore } from '@reduxjs/toolkit'

const store = configureStore({
  reducer: {
    // your reducers here
  }
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>;
export default store 