/* global window */
/* global document */
/* global localStorage */

import React, { PureComponent, Fragment } from 'react'
import NProgress from 'nprogress'
import PropTypes from 'prop-types'
import pathToRegexp from 'path-to-regexp'
import { connect } from 'dva'
import { Loader, MyLayout, LandingLayout, SocketIO } from 'components'
import { BackTop, Layout } from 'antd'
import { classnames, config } from 'utils'
import { Helmet } from 'react-helmet'
import { withRouter } from 'dva/router'
import { injectIntl, FormattedMessage } from 'react-intl'
import Error from './error'
import '../themes/index.less'
import './app.less'

const { Content, Footer, Sider } = Layout
const { Header, Bread, styles } = MyLayout
const { LandingHeader, LandingFooter } = LandingLayout
const { Socket, Event } = SocketIO
const { prefix, openPages, rtlCSS } = config

let lastHref

class App extends PureComponent {

  updateTimeHandler ({ time }) {
    // console.log('time: ', time)
    this.props.dispatch({ type: 'app/updateTime', payload: { time } })
  }
  render () {
    const {
      children, dispatch, app, loading, location, intl
    } = this.props
    const {
      user, siderFold, darkTheme, isNavbar, menuPopoverVisible, navOpenKeys, menu, permissions,
    } = app
    let { pathname } = location
    pathname = pathname.startsWith('/') ? pathname : `/${pathname}`
    const { iconFontJS, iconFontCSS, logo } = config
    const current = menu.filter(item => pathToRegexp(item.route || '').exec(pathname))
    const hasPermission = current.length ? permissions.visit.includes(current[0].id) : false
    const { href } = window.location
    if (lastHref !== href) {
      console.log('loading: ', loading)
      NProgress.start()
      // if(loading.effects['app/handleIO']) {
      //   NProgress.done()
      //   lastHref = href
      // }
      if (!loading.global) {
        NProgress.done()
        lastHref = href
      }
    }

    const headerProps = {
      menu,
      user,
      location,
      siderFold,
      isNavbar,
      menuPopoverVisible,
      navOpenKeys,
      switchMenuPopover () {
        dispatch({ type: 'app/switchMenuPopver' })
      },
      logout () {
        // updateTimeUnSub();
        dispatch({ type: 'app/logout' })
      },
      switchSider () {
        dispatch({ type: 'app/switchSider' })
      },
      changeOpenKeys (openKeys) {
        dispatch({ type: 'app/handleNavOpenKeys', payload: { navOpenKeys: openKeys } })
      },
    }

    const siderProps = {
      menu,
      location,
      siderFold,
      darkTheme,
      navOpenKeys,
      changeTheme () {
        dispatch({ type: 'app/switchTheme' })
      },
      changeOpenKeys (openKeys) {
        window.localStorage.setItem(`${prefix}navOpenKeys`, JSON.stringify(openKeys))
        dispatch({ type: 'app/handleNavOpenKeys', payload: { navOpenKeys: openKeys } })
      },
    }

    const breadProps = {
      menu,
      location,
    }

    const landingHeaderProps = {
      location
    }

    if (openPages && openPages.includes(pathname)) {
      return (
        <div>
          <Loader fullScreen spinning={loading.effects['app/query']} />
          <Layout>
            <LandingHeader {...landingHeaderProps} />
            <Layout>
              <Content>
                <div>{app.time}</div>
                <div>
                  <button onClick={() => {
                    localStorage.setItem('locale', 'ar')
                    window.location.reload()
                  }}>AR</button>
                  <button onClick={() => {
                    localStorage.setItem('locale', 'en')
                    window.location.reload()
                  }}>EN</button>
                </div>
                {children}
              </Content>
            </Layout>
            <LandingFooter />
          </Layout>
          /
        </div>
      )
    }

    return (
      <Socket>
        <Fragment>
          <Loader fullScreen spinning={loading.effects['app/query']} />
          <Helmet htmlAttributes={{ lang : locale }}>
            <title>ANTD ADMIN</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="icon" href={logo} type="image/x-icon" />
            {iconFontJS && <script src={iconFontJS} />}
            {iconFontCSS && <link rel="stylesheet" href={iconFontCSS} />}
            {rtlCSS && intl.locale === 'ar' && <link rel="stylesheet" href={rtlCSS} />}
          </Helmet>
          <Layout className={classnames({ [styles.dark]: darkTheme, [styles.light]: !darkTheme })}>
            {!isNavbar && <Sider
              trigger={null}
              collapsible
              collapsed={siderFold}
            >
              {siderProps.menu.length === 0 ? null : <MyLayout.Sider {...siderProps} />}
            </Sider>}
            <Layout style={{ height: '100vh', overflow: 'scroll' }} id="mainContainer">
              <BackTop target={() => document.getElementById('mainContainer')} />
              <Header {...headerProps} />
              <Event event='updateTime' handler={this.updateTimeHandler.bind(this)} />
              <div>{app.time}</div>
              <div>{app.serverStatus}</div>
              <Content>
                <Bread {...breadProps} />
                {hasPermission ? children : <Error />}
              </Content>
              <Footer >
                {config.footerText}
              </Footer>
            </Layout>
          </Layout>
        </Fragment>

      </Socket>
    )
  }
}

App.propTypes = {
  children: PropTypes.element.isRequired,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  app: PropTypes.object,
  loading: PropTypes.object,
}

export default injectIntl(withRouter(connect(({ app, loading }) => ({ app, loading }))(App)))
