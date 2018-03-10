import React from 'react';
// import { Parser } from 'html-to-react';
import { eventChannel } from 'redux-saga';


export function subscribe(socket, id) {
  return eventChannel((emit) => {
    if(!socket) return () => n
    const updateTimeHandler = ({ time }) => {
      emit({
        type: 'updateTime',
        payload: {
          time,
        },
      })
    }

    socket.on('updateTime', updateTimeHandler)
    const connectHandler = () => {
      emit({ type: 'serverStatus', payload: 'on' })
    }

    socket.on('connect', connectHandler)

    const dissConnectHandler = (e) => {
      console.log('disconnect: ', e)
      emit({ type: 'serverStatus', payload: 'off' })
    }
    socket.on('disconnect', dissConnectHandler);

    const reconnectHandler = (e) => {
      console.log('reconnect_attempt: ', e)
      emit({ type: 'serverStatus', payload: 'reconnect' })
    }
    socket.on('reconnect_attempt', reconnectHandler)
    return () => {
      socket.off('updateTime', updateTimeHandler)
      socket.off('connect', connectHandler)
      socket.off('disconnect', dissConnectHandler)
      socket.off('reconnect_attempt', reconnectHandler)
    }
  })
}
