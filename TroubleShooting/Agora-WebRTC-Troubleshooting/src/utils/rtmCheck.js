import AgoraRtm from 'agora-rtm-sdk'
import {APP_ID as DEFINED_APP_ID}from './settings'

const getAppid = ()=>{
  return DEFINED_APP_ID || window.APP_ID
}

export const initalizeRtm = (useProxy = false)=>{
  return new Promise(async (resolve, reject)=>{
    const appId = getAppid()

    const client = AgoraRtm.createInstance(appId,{
      enableCloudProxy: useProxy,
      logFilter: AgoraRtm.LOG_FILTER_DEBUG 
    })

    client.on('ConnectionStateChanged', async (state, reason)=>{
      if(state === 'CONNECTED'){
        resolve(state)
      }else if(state === 'CONNECTING') {
        // noop
      }else{
        reject(state)
      }
    })
    await client.login({uid: 'hogemaru'})

    await client.login({
      uid: (Math.random()*10000).toString(),
    })
  })
}