import React from 'react';
// import { Parser } from 'html-to-react';
import { eventChannel } from 'redux-saga';


export function subscribe(socket, id) {
  return eventChannel((emit) => {
    socket.on('users.login', ({ username }) => {
      // emit(actions.addUser({ username }));
    });
    socket.on('updateTime', ({ time }) => {
      // console.log('time ', time)
      emit({
        type: 'updateTime',
        payload: {
          time,
        },
      });
    });
    socket.on('disconnect', (e) => {
      // TODO: handle
    });
    return () => {};
  });
}
