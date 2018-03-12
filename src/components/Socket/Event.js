import React from 'react';
import PropTypes from 'prop-types';

class Event extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  componentDidMount() {
    const { event, handler } = this.props;
    const { socket } = this.context;

    if (!socket) {
      return;
    }

    socket.on(event, handler);
  }

  componentWillUnmount () {
    const { event, handler } = this.props;
    const { socket } = this.context;

    if (!socket) {
      return;
    }

    socket.off(event, handler);
  }

  render() {
    return false;
  }
};

Event.contextTypes = {
  socket: PropTypes.object.isRequired
};

Event.propTypes = {
  event: PropTypes.string.isRequired,
  handler: PropTypes.func.isRequired
};

export default Event;
