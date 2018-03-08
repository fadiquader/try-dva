// import React from 'react';
// // import { Parser } from 'html-to-react';
// import { eventChannel } from 'redux-saga';
//
// // const htmlToReactParser = new Parser();
//
// export function subscribe(socket, id) {
//   return eventChannel((emit) => {
//     socket.on('users.login', ({ username }) => {
//       // emit(actions.addUser({ username }));
//     });
//     socket.on('users.logout', ({ username }) => {
//       // emit(actions.removeUser({ username }));
//     });
//
//     socket.on(`notification.new_${id}`, ({ notification: noti }) => {
//       emit(actions.newNotification({ notification: noti }));
//     })
//     socket.on(`notification.remove_${id}`, (data) => {
//
//     });
//     socket.on('disconnect', (e) => {
//       // TODO: handle
//     });
//     return () => {};
//   });
// }
