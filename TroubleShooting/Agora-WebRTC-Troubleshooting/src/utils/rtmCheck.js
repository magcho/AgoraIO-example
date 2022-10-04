import AgoraRtm from 'agora-rtm-sdk'
import {APP_ID as DEFINED_APP_ID}from './settings'

const getAppid = ()=>{
  return DEFINED_APP_ID || window.APP_ID
}

export const initalizeRtm = ()=>{
  console.log('hello')
  return new Promise(async (resolve, reject)=>{
    const appId = getAppid()

    const client = AgoraRtm.createInstance(appId)

    client.on('ConnectionStateChanged', async (state, reason)=>{
      console.log(':sushi:',reason)
      if(state === 'CONNECTED'){
        console.log('conected', reason)
        resolve()
      }else if(state === 'ABORTED'){
        console.error(reason)
        reject()
      }

      await client.logout()
    })

    await client.login({
      uid: (Math.random()*10000).toString(),
    })
  })
}