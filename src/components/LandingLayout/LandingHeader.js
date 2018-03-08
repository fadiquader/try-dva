import pathToRegexp from 'path-to-regexp'
import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Layout, Menu } from 'antd'

// const { Header } = Layout;

const LandingHeader = props => {
  const { location } = props;
  const selectedKeys = [];
  if( pathToRegexp('/login').exec(location.pathname)){
    selectedKeys.push('/login')
  }
  return (
    <div>
      <Menu mode="horizontal" selectedKeys={selectedKeys}>
        <Menu.Item key={'/login'}>
          <Link to={'/login'}>
            Login
          </Link>
        </Menu.Item>
      </Menu>
    </div>
  )
};

LandingHeader.propTypes = {
  // menu: PropTypes.array,
  // siderFold: PropTypes.bool,
  // darkTheme: PropTypes.bool,
  // navOpenKeys: PropTypes.array,
  // changeOpenKeys: PropTypes.func,
  location: PropTypes.object,
}


export default LandingHeader;
