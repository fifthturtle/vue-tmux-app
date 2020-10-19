// jshint esversion:6

import Vue from 'vue';
import Vuex from 'vuex';
import apiCalls from '@/services/apiCalls.js';
const sha1 = require('sha1');

const SERVER = 'server';
const SESSION = 'session';
const WINDOW = 'window';
const PANE = 'pane';
const TYPES = [SERVER, SESSION, WINDOW];

function p(s, plural = true) {
  if (!isNaN(s)) s = TYPES[s];
  if (plural) s += "s";
  return s;
}

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    loggedIn: 0,
    servers: [],
    sessions:[],
    windows: [],
    current: {
      server: false,
      session: false,
      window: false
    },
    fullScreen: true
  },
  mutations: {
    UPDATE_COMPONENT(state, data) {
      state[p(data.type)] = data.components;
    },
    UPDATE_CURRENT(state, data) {
      state.current[p(data.type, false)] = data.id;
      if (!data.id)
        state[p(data.type)] = [];
      else
      {
        data.id = [data.id];
        for (let i = data.type - 1; i >= 0; i--)
          data.id.unshift(state.current[p(i, false)]);
        this._vm.$socket.client.emit('update-room', data);
      }
    },
    TOGGLE_FULLSCREEN(state) {
      state.fullScreen = !state.fullScreen;
    }
  },
  actions: {
    logIn({ state }, data) {
      state.loggedIn = data;
    },
    socket_updateComponent({ state, commit, dispatch }, data) {
      if (data.components.length < state[p(data.type)].length)
      {
        if (!state[p(data.type)].find(c => { return c.id === state.current[p(data.type, false)].id; }))
          state.current[p(data.type, false)] = false;
      }
      commit("UPDATE_COMPONENT", data);
      if (!state.current[p(data.type, false)] && data.components.length)
        dispatch('selectComponent', { type: data.type, id: state[p(data.type)][0].id })
    },
    socket_componentData({ state }, data) {
      let change = state[p(data.type)].find(s => {
        return s.id === data.id;
      });
      if (change) change[data.key] = data.value;
    },
    selectComponent({ commit, dispatch }, data) {
      if (typeof data.type === 'string') data.type = TYPES.indexOf(data.type);
      if (data.type < 0 || data.type >= TYPES.length || isNaN(data.type)) return;
      if (data.id)
        for (let i = data.type + 1; i <= TYPES.length; i++) dispatch('selectComponent', { type: i, id: false });
      commit('UPDATE_CURRENT', data);
    },
    toggleFullScreen({ commit }) {
      commit('TOGGLE_FULLSCREEN');
    }
  },
  getters: {
    currentServer: state => {
      return state.servers.find(s => {
        return s.id === state.current.server;
      });
    },
    serverTree: state => {
      let servers = state.servers;
      return servers.map(server => {
        if (server.id === state.current.server) server.sessions = state.sessions;
        return server;
      })
    }
  }
});