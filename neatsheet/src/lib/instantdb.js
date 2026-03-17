import { init } from '@instantdb/react'

const DEFAULT_INSTANT_APP_ID = '030027bb-363b-4147-85a2-9ae83c580d43'

export const instantAppId = import.meta.env.VITE_INSTANTDB_APP_ID || DEFAULT_INSTANT_APP_ID

export const db = init({
  appId: instantAppId,
})
