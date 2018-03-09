import React from 'react';
// import { Parser } from 'html-to-react';
import { eventChannel } from 'redux-saga';


export function subscribe(socket, id) {
  return eventChannel((emit) => {
    const updateTimeHandler = ({ time }) => {
      emit({
        type: 'updateTime',
        payload: {
          time,
        },
      })
    }
    socket.on('updateTime', updateTimeHandler)
    socket.on('disconnect', (e) => {
      // TODO: handle
    })
    return () => {
      socket.off('updateTime', updateTimeHandler)
    }
  })
}
