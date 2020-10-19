<template>
    <div class="tmux-header">
        <div v-if="current.server">Server: {{ servers.find(s => { return s.id === current.server }).name }}</div>
        <div>Sessions: 
            <ul>
                <li v-for="session in sessions" :key="session.id">
                    <span :class="(session.id === current.session) ? 'selected' : ''" @click="setSession(session.id)">{{ session.name }}</span>
                </li>
            </ul>
        </div>
        <div v-if="windows.length">Windows: 
            <ul>
                <li v-for="window in windows" :key="window.id">
                    <span :class="(window.id === current.window) ? 'selected' : ''" @click="setWindow(window.id)">{{ window.name }}</span>
                </li>
            </ul>
        </div>
        <div v-if="panes.length">Panes: 
            <ul>
                <li v-for="pane in panes" :key="pane.id">
                    <span :class="(pane.id === current.pane) ? 'selected' : ''" @click="setPane(pane.id)">{{ pane.name }}</span>
                </li>
            </ul>
        </div>
                
    </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "server",
  methods: {
    setSession(id) {
      this.$store.dispatch("setSession", id);
    },
    setWindow(id) {
      this.$store.dispatch("setWindow", id);
    },
    setPane(id) {
      this.$store.dispatch("setPane", id);
    }
  },
  computed: {
    ...mapState(["servers", "current", "sessions", "windows", "panes"])
  }
};
</script>

<style scoped>
ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
  padding-left:8px;
  overflow: hidden;
  background-color: #333333;
  display: inline;
}

ul li {
    display: inline;
}

ul li span {
  display: inline-block;
  color: white;
  text-align: left;
  padding: 8px 16px;
  text-decoration: none;
}

ul li span:hover {
  background-color: #111111;
  cursor: pointer;
}

.selected::before {
  content: "\21AA";
  padding-right: 3px;
  color: yellow;
}

.tmux-header {
  height: 15%;
  border-bottom: 2px solid yellow;
  background-color: black;
  color: yellow;
  padding: 20px;
  font-size: 1.5em;
}
</style>