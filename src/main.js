//*
import Vue from 'vue'
import App from './App.vue'
import store from './store'
import SocketIO from 'socket.io-client';
import VueSocketIOExt from 'vue-socket.io-extended';

import '@progress/kendo-ui';
import '@progress/kendo-theme-default/dist/all.css'

import { Button,
  ButtonGroup,
  ButtonGroupButton,
  ToolBar,
  ToolBarItem,
  ButtonsInstaller } from '@progress/kendo-buttons-vue-wrapper';

Vue.use(ButtonsInstaller)

import { Dialog } from '@progress/kendo-dialog-vue-wrapper'
import { DialogInstaller } from '@progress/kendo-dialog-vue-wrapper'
import { Tooltip,
  Notification,
  KendoPopupsInstaller } from '@progress/kendo-popups-vue-wrapper'
import { TreeView,
         TreeViewItem,
         TreeViewInstaller } from '@progress/kendo-treeview-vue-wrapper'
import { DataSource,
         HierarchialDataSource,
         DataSourceInstaller } from '@progress/kendo-datasource-vue-wrapper'

Vue.use(KendoPopupsInstaller)
Vue.use(DialogInstaller)
Vue.use(TreeViewInstaller)
Vue.use(DataSourceInstaller)

let port = (window.location.port.length) ? window.location.port : '8061';
let address = `${window.location.protocol}//${window.location.hostname}:${port}/tmux-app`;

export const SocketInstance = SocketIO(address, { path: '/myapp/socket.io', transports: ['websocket'] });

Vue.use(VueSocketIOExt, SocketInstance, { store });
Vue.config.productionTip = false

new Vue({
  store,
  components: {
      Button,
      ButtonGroup,
      ButtonGroupButton,
      ToolBar,
      ToolBarItem,
      Dialog,
      Tooltip,
      TreeView,
      TreeViewItem,
      HierarchialDataSource
  },
  render: h => h(App)
}).$mount('#app')