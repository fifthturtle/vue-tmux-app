<template>
  <div id="app">
    <div class="half-screen screen-servers" v-if="fullScreen">
      <servers></servers>
    </div>
    <div class="half-screen screen-tmux" :style="(fullScreen) ? { width: '80%' } : { width: '100%' }">
      <tmux></tmux>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import servers from "@/components/servers";
import tmux from "@/components/tmux";

export default {
  components: {
    servers,
    tmux
  },
  sockets: {
    connect() {
      console.log('socket connected');
    },
    customEmit(data) {
      console.log('this method was fired by the socket server', data);
    }
  },
  methods: {
    _keyup(evt) {
      console.log('key up', evt);
    },
    getTmux() {
      //this.$store.dispatch("getServers");
    }
  },
  computed: {
    ...mapState(['fullScreen'])
  },
  created() {
    console.log(window, window.location);
    this.getTmux();
  },
  mounted() {
    window.addEventListener('keyup', evt => {
      if (evt.altKey) {
        if (evt.keyCode === 74) this.$store.dispatch('toggleFullScreen');
      }
    });
  }
};
</script>

<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100vh;
}

.half-screen {
  display: inline-block;
  vertical-align: top;
  height: 100%;
  background-color: black;
  overflow: hidden;
}

.screen-servers {
  width: calc(20% - 10px);
  border-right: 10px inset lightgray;
}

.screen-tmux {
  font-family: monospace, monospace;
}
</style>
