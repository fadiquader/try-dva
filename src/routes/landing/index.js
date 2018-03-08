import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Button, Row, Form, Input } from 'antd'
import { config } from 'utils'
import styles from './index.less'


const Landing = props => {

  return (
    <div>
      Landing page
    </div>
  )
};

export default connect(({ loading }) => ({ loading }))(Landing)
