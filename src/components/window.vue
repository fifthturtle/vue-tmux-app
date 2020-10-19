<template>
  <div class="window" ref="window" v-if="window">
      <pane class="window-pane" v-for="pane in layout.panes" :key="pane.id" :id="pane.id" :activePane="pane.id === activePane" @clicked="setActivePane"  @dblclicked="setZoomedPane(pane.id)" :style="getStyle(pane)"></pane>
  </div>
</template>

<script>
import { mapState } from "vuex";
import pane from '@/components/pane';

export default {
    name: 'window',
    components: {
        pane
    },
    sockets: {
        windowLayout(data) {
            this.layout = data.layout;
        }
    },
    data() {
        return {
            layout: {
                panes: [],
                dimensions: {}
            },
            activePane: false,
            zoomedPane: false
        }
    },
    methods: {
        getStyle(_pane) {
            if (this.zoomedPane === _pane.id) return { width: '100%', height: '100%', left: 0, top: 0, 'z-index': 100 }
            let obj = {};
            if (this.activePane === _pane.id) {
                obj['border-color'] = 'green';
                obj['outline-color'] = 'green';
            }
            let _top = (_pane.top == 0) ? 0 : _pane.top - 1;
            let _left = (_pane.left == 0) ? 0 : _pane.left - 1;
            let _height = (_pane.top == 0) ? _pane.height : _pane.height + 1;
            let _width = (_pane.left == 0) ? _pane.width : _pane.width + 1;
            _width = ((_width/this.layout.dimensions.width) * 100).toString() + "%";
            _height = ((_height/this.layout.dimensions.height) * 100).toString() + "%";
            obj.left = ((_left/this.layout.dimensions.width) * 100).toString() + "%";
            obj.top = ((_top/this.layout.dimensions.height) * 100).toString() + "%";

            obj.width = `calc(${_width} - 2px)`;
            obj.height = `calc(${_height} - 2px)`;

            obj['z-index'] = 0;
            return obj;
        },
        setActivePane(id, $evt) {
            if (!$evt) return;
            let current = this.$store.state.current;
          if ($evt.shiftKey) this.$socket.client.emit('tmux-command', { params: { pane: id, window: current.window, session: current.session }, current: this.$store.state.current, command: 'select-pane' });
          this.activePane = id;
        },
        setZoomedPane(id) {
            this.zoomedPane = (this.zoomedPane === id) ? false : id;
        }
    },
    computed: {
        ...mapState(["current"]),
        window() {
            return this.$store.state.current.window;
        },
        dimensions() {
            return this.$refs.window;
        }
    }
}
</script>

<style>
    .window {
         position:relative;
         height:90%;
         overflow: hidden;
    }

    .window-pane {
        position:absolute;
        border:1px solid gray; 
        outline: 1px solid transparent;
    }
</style>