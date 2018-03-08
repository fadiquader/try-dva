
import React from 'react'
import PropTypes from 'prop-types'
import { Switch, Route, Redirect, routerRedux } from 'dva/router'
import dynamic from 'dva/dynamic'
import App from 'routes/app'
import { LocaleProvider } from 'antd'
import { IntlProvider, addLocaleData } from 'react-intl'
import moment from 'moment';
import en from 'react-intl/locale-data/en';
import ar from 'react-intl/locale-data/ar';

const { ConnectedRouter } = routerRedux
// import enUS from 'antd/lib/locale-provider/en_US'
// import arEG from 'antd/lib/locale-provider/ar_EG'

addLocaleData([...en, ...ar])
const locale = localStorage.getItem('locale') || 'en';
window.locale = locale
const messages = require('./translations/'+locale+'.json')
const antLocale = {
  'ar': require('antd/lib/locale-provider/ar_EG'),
  'en': require('antd/lib/locale-provider/en_US'),
};
if(locale !== 'en') {
  require('moment/locale/'+locale+'.js')
}
moment.locale(locale)

const Routers = function ({ history, app }) {
  const error = dynamic({
    app,
    component: () => import('./routes/error'),
  })
  const routes = [
    {
      path: '/',
      exact: true,
      // models: () => [import('./models/dashboard')],
      component: () => import('./routes/landing/'),
    },
    {
      path: '/dashboard',
      models: () => [import('./models/dashboard')],
      component: () => import('./routes/dashboard/'),
    }, {
      path: '/user',
      models: () => [import('./models/user')],
      component: () => import('./routes/user/'),
    }, {
      path: '/user/:id',
      models: () => [import('./models/user/detail')],
      component: () => import('./routes/user/detail/'),
    }, {
      path: '/login',
      models: () => [import('./models/login')],
      component: () => import('./routes/login/'),
    }, {
      path: '/request',
      component: () => import('./routes/request/'),
    }, {
      path: '/UIElement/iconfont',
      component: () => import('./routes/UIElement/iconfont/'),
    }, {
      path: '/UIElement/search',
      component: () => import('./routes/UIElement/search/'),
    }, {
      path: '/UIElement/dropOption',
      component: () => import('./routes/UIElement/dropOption/'),
    }, {
      path: '/UIElement/layer',
      component: () => import('./routes/UIElement/layer/'),
    }, {
      path: '/UIElement/dataTable',
      component: () => import('./routes/UIElement/dataTable/'),
    }, {
      path: '/UIElement/editor',
      component: () => import('./routes/UIElement/editor/'),
    }, {
      path: '/chart/ECharts',
      component: () => import('./routes/chart/ECharts/'),
    }, {
      path: '/chart/highCharts',
      component: () => import('./routes/chart/highCharts/'),
    }, {
      path: '/chart/Recharts',
      component: () => import('./routes/chart/Recharts/'),
    }, {
      path: '/post',
      models: () => [import('./models/post')],
      component: () => import('./routes/post/'),
    },
  ]

  return (
    <LocaleProvider locale={antLocale[locale]}>
      <IntlProvider
        locale={locale}
        messages={messages}
        now={Date.now()}>
        <ConnectedRouter history={history}>
          <App>
            <Switch>
              {/*<Route exact path="/" render={() => (<Redirect to="/dashboard" />)} />*/}
              {
                routes.map(({ path, ...dynamics }, key) => (
                  <Route key={key}
                         exact
                         path={path}
                         component={dynamic({
                           app,
                           ...dynamics,
                         })}
                  />
                ))
              }
              <Route component={error} />
            </Switch>
          </App>
        </ConnectedRouter>
      </IntlProvider>
    </LocaleProvider>
  )
}

Routers.propTypes = {
  history: PropTypes.object,
  app: PropTypes.object,
}

export default Routers
