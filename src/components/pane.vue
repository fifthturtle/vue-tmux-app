<template>
  <div class="pane" @click="$emit('clicked', id, $event)" @dblclick="$emit('dblclicked', id)">
      <transition name="headerFade">
        <!--<div id="pane-header" v-show="showHeader || true" @mousemove="onHeader = true" @mouseleave="onHeader = false" ref="header">-->
        <div id="pane-header" v-if="onHeader" ref="header">
          <div v-if="loggedIn">
            <label>CMD: <input type="text" v-model="textCommand" size="16" maxlength="40" v-on:keyup.38="inputLine(1)" v-on:keyup.40="inputLine(-1)" v-on:keyup.enter="sendCommand({ command: 'pipe-pane', params: { id } })" :disabled="loggedIn < 2"/></label>
           
            <span class="kendo-spacer">|</span>
            <span class="toolbar-button">
              <kendo-tooltip title="Split Pane Horizontally"
                             :position="'top'">
                <kendo-button @click="sendSocketCommand({ command: 'split-pane', params: { id, direction: 'h' } })" style="color: red;" icon="logout" :disabled="loggedIn < 2"></kendo-button>
              </kendo-tooltip>
            </span>
            <span class="toolbar-button">
              <kendo-tooltip title="Split Pane Vertically"
                             :position="'top'">
                <kendo-button @click="sendSocketCommand({ command: 'split-pane', params: { id, direction: 'v' } })" style="color: red;" icon="download" :disabled="loggedIn < 2"></kendo-button>
              </kendo-tooltip>
            </span>
            <span class="kendo-spacer">|</span>
            <span class="toolbar-button">
              <kendo-tooltip title="Kill Pane"
                             :position="'top'">
                <kendo-button @click="prompt('kill-pane', 'Kill Pane? This will kill any running processes.', id)" icon="cancel" style="color: red;" :disabled="loggedIn < 2"></kendo-button>
              </kendo-tooltip>
            </span>
            <span class="toolbar-button">
              <kendo-tooltip title="Kill Process"
                             :position="'top'">
                <kendo-button @click="prompt('kill-pane-process', 'Kill Pane Process?', id)" style="color: red;" icon="close" :disabled="loggedIn < 2"></kendo-button>
              </kendo-tooltip>
            </span>
            <span class="toolbar-button">
              <kendo-tooltip title="Restart Process"
                             :position="'top'">
                <kendo-button @click="prompt('restart-pane', 'Restart Pane Process?', id)" icon="reset" style="color: red;"></kendo-button>
              </kendo-tooltip>
            </span>
            <span class="kendo-spacer">|</span>
            <kendo-button v-if="selection.start >= 0 && selection.end >= 0" @click="capturePane()" icon="hyperlink-email" style="color: blue;"></kendo-button>
          </div>
          <div v-else>
              <label>Password: <input type="password" v-model="password" v-on:keyup.enter="login"></label>
              <button @click="login">Log In</button>
            </div>
        </div>
      </transition>
      <div class="tmux" v-show="tmuxData.top.length || tmuxData.lines.length" @wheel="wheel" @mousemove="paneMouseMove" @mouseleave="showHeader = false">
          <transition name="fadeScrollbar">
            <div class="scrollbar" v-if="activePane && !tmuxData.top.length" @click="scrollBarClicked">
              <div class="scrollwidget" :style="scrollwidgetStyle" @click="scrollWidgetClicked" @mousedown="scrollWidgetDown" @mouseup="scrollWidgetUp" @mousemove="scrollWidgetMove" @mouseout="scrollWidgetUp"></div>
            </div>
          </transition>
        <div class="tmux-data-wrapper" id="tmux-data-wrapper" v-if="!tmuxData.top.length" ref="wrapper">
            <div class="tmux-data" v-for="(line, index) in tmuxData.lines" :key="index" @click="lineClicked(index, $event)" :class="(index <= selection.end && index >= selection.start) ? 'selected-line' : ''">
                <div class="tmux-user" v-if="line.userHost">{{ getInputLine(line) }}</div>
                <div class="tmux-text" v-if="line.userHost">
                    <div v-for="(_line, _index) in line.lines" :key="_index" style="display:flex">{{ _line }}</div>
                </div>
                <div class="tmux-response" v-else-if="Array.isArray(line)">
                  <span v-for="(chars, _index) in line" :key="_index" :style="chars.style || {}">{{ chars.chars }}</span>
                </div>
                <div class="tmux-response" v-else>{{ line }}</div>
            </div>
        </div>
        <div v-else class="tmux-data-wrapper" id="tmux-top-wrapper">
            <div class="tmux-data tmux-top-data" v-for="(line, index) in tmuxData.top" :key="index">
                    <span v-for="(span, _index) in line" :key="_index" :style="span.style || {}">{{ span.chars }}</span>
            </div>
      </div>
      <div style="position:absolute;top:0px; right:calc(4.8% - 10px); height:10px; width:10px;">
        <kendo-button @click="onHeader = !onHeader" icon="'arrow-60-up'" />
        <!--<kendo-button @click="onHeader = !onHeader" icon="'arrow-60-down'" :style="{ display: onHeader ? 'none' : 'inline-block' }" /> -->
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import apiCalls from '@/services/apiCalls.js';
const sha1 = require('sha1');

export default {
    name: 'pane',
    props: ['id', 'activePane'],
    data() {
      return {
        textCommand: '',
        showHeader: false,
        nInputLine: -1,
        onHeader: false,
        clientHeight: 0,
        scrollHeight: 1,
        scrollTop: 0,
        scrolling: false,
        tmuxData: {
          top: [],
          lines: []
        },
        selection: {
          start: -1,
          end: -1
        },
        password: ""
      }
    },
    sockets: {
      tmuxLoginReceived(data) {
        this.password = '';
        this.$store.dispatch('logIn', data.match);
        if (!data.match) {
          kendo.alert('The password is not correct.');
        }
      },
      paneTopData(data) {
        if (data.id !== this.id) return;
        this.tmuxData.top = data.data;
      },
      paneData(data) {
        if (data.id !== this.id) return;
        this.tmuxData.top = [];
        let lines = data.lines;
        let last = lines[lines.length - 1];
        while (lines.length && !last.userHost && (typeof last === 'string') && !last.trim().length) {
            lines.pop();
            if (lines.length) last = lines[lines.length - 1];
        }

        if (!lines.length) return;
        if (this.tmuxData.lines.length) {
            let last = this.tmuxData.lines[this.tmuxData.lines.length - 1];
            let first = lines[0];
            if (last.userHost && first.userHost && !last.lines.filter(l => { return !!l; }).length) this.tmuxData.lines.pop();
        }
        lines.forEach(line => { this.tmuxData.lines.push(line); });
        while (this.tmuxData.lines.length > 2000) this.tmuxData.lines.shift();
        
        setTimeout(this.scrollBottom, 100);
      }
    },
    methods: {
      login() {
        let password = sha1(this.password);
        this.$socket.client.emit('tmux-login', { password });
      },
      inputLine(val) {
        let temp = this.nInputLine + val;
        if (temp < 0) 
        {
          this.nInputLine = -1;
          this.textCommand = "";
          return;
        }
        let iLines = this.tmuxData.lines.filter(line => {
          return (line.userHost && line.lines[0].length);
        }).reverse();
        if (temp >= iLines.length) return;
        this.textCommand = iLines[temp].lines[0].trim();
        this.nInputLine = temp;
      },
        getInputLine(line) {
          let ret = `${line.userHost} ${line.currentDirectory}`;
          if (line.wrap) ret = `${line.wrap.start}${ret}${line.wrap.end}${line.char}`;
          return ret;
        },
        lineClicked(line, evt) {
          if (evt.altKey) {
            this.selection.start = -1;
            this.selection.end = -1;
            return;
          }
          if (!evt.ctrlKey) return;
          if (this.selection.start < 0 && this.selection.end < 0)
          {
            this.selection.start = line;
            this.selection.end = line;
          } else {
            if (line <= this.selection.end) {
              this.selection.start = line;
            } else {
              this.selection.start = this.selection.end;
              this.selection.end = line;
            }
          }
        },
        capturePane() {
          kendo.prompt("Enter a message to send to the developers:", "message to developers").then(message => {
            let selection = [];
            for (let i = this.selection.start; i <= this.selection.end; i++) selection.push(this.tmuxData.lines[i]);
            this.$socket.client.emit('tmux-capture-pane', { id: this.id, selection, message, current: this.$store.state.current });
            this.selection.start = -1;
            this.selection.end = -1;
          }, () => {
            console.log('pane data not sent');
          })
        },
        prompt(command, msg, id) {
          kendo.confirm(msg).then(() => {
            this.sendSocketCommand({ command, params: { id } });
          }, () => {
            console.log('Canceled');
          });
        },
        sendSocketCommand(data) {
          data.current = this.$store.state.current;
          this.$socket.client.emit('tmux-command', data);
        },
        sendCommand(data) {
          data.current = this.$store.state.current;
          data.params.textCommand = this.textCommand;
          this.$socket.client.emit('tmux-command', data);
          this.textCommand = "";
          this.nInputLine = -1;
        },
        scrollBarClicked(evt) {
          let pct = (evt.offsetY / evt.target.offsetHeight);
          this.$refs.wrapper.scrollTop = this.$refs.wrapper.scrollHeight * pct;
          this.setScroll();
        },
        scrollWidgetClicked(evt) {
          evt.stopPropagation();
        },
        scrollWidgetDown(evt) {
          this.scrolling = { distance: 0 };
        },
        scrollWidgetUp(evt) {
          this.scrolling = false;
        },
        scrollWidgetMove(evt) {
          if (this.scrolling) {
            this.scrolling.distance += evt.movementY;
            if (Math.abs(this.scrolling.distance) >= 10) {
              this.$refs.wrapper.scrollTop += this.scrolling.distance;
              this.scrolling.distance = 0;
              this.setScroll();
            }
          }
        },
        setScroll() {
          if (!this.$refs.wrapper) return;
          this.clientHeight = this.$refs.wrapper.clientHeight;
          this.scrollHeight = this.$refs.wrapper.scrollHeight;
          this.scrollTop = this.$refs.wrapper.scrollTop;
        },
        scrollBottom() {
            if (!this.$refs.wrapper) return;
            this.$refs.wrapper.scrollTop = this.$refs.wrapper.scrollHeight;
            this.setScroll();
        },
        wheel(evt) {
            if (!this.$refs.wrapper) return;
            this.$emit('clicked', this.id);
            this.$refs.wrapper.scrollTop += evt.deltaY;
            this.setScroll();
        },
        paneMouseMove(evt) {
          this.showHeader = ((evt.layerY / this.$refs.wrapper.clientHeight) <= .1);
        },
        getTmuxData(count = 0) {
          if (count === 5) return;
          let path = `tmux/pane-data/${this.current.server}/${this.current.session.replace('$','')}/${this.current.window.replace('@','')}/${this.id.replace('%','')}`;
          apiCalls.get(path)
            .then(res => {
              if (res)
                this.tmuxData = res;
              else
                this.getTmuxData(++count);
            }).catch(err => {});
        }
    },
    computed: {
        ...mapState(["current", "loggedIn"]),
        scrollwidgetStyle() {
          let height = ((this.clientHeight / this.scrollHeight) * 100).toString() + "%";
          let top = ((this.scrollTop / this.scrollHeight) * 100).toString() + "%";
          return { height, top };
        }
    },
    created() {
      this.getTmuxData();
    },
    mounted() {
        this.$nextTick(function () {
            setTimeout(this.scrollBottom, 500);
        })
    }

}
</script>

<style scoped>
.pane {
  user-select: none;
}

.selected-line {
  background-color: rgba(255,255,153,0.3);
}

.tmux {
  height: 100%;
}

.tmux-data-wrapper {
  position: relative;
  height: calc(100% - 2px);
  overflow: hidden;
  background-color: #1e1e1e;
  color: #cccccc;
}

.tmux-data {
  display: flex;
  padding: 0 4px;
  font-size: 0.7em;
  min-height: 0.9em;
}

.tmux-data div {
  min-height: 0.9em;
}

.tmux-data span {
  white-space: pre;
}

.line-input {
  background-color: #1e1e1e;
  padding-bottom: 4px;
}

.line-output {
  background-color: #1e1e1e;
}

.tmux-user {
  color: cyan;
  padding-right:10px;
}

.tmux-response {
  font-weight: 600;
  padding-left: 2px;
  text-align: left;
}

.kendo-spacer
{
  width:10px;
  text-align:center;
}

.scrollbar {
  position:absolute;
  right:0;
  top:0;
  z-index: 1;
  width:12px;
  margin:14px;
  border:1px solid black;
  background-color: gray;
  height:calc(100% - 28px);
  border-radius: 20px;
  box-shadow: inset 2px 2px 4px rgba(30,30,30,0.9);
}

.scrollwidget {
  width:calc(100% - 2px);
  background-color:grey;
  border: 1px solid black;
  position:relative;
  border-radius: 5px;
  transform: scaleX(2.1) translateX(0.5px);
  box-shadow: 0px 2px 8px black, inset 2px 2px 4px darkgrey;
  transform-origin: center;
}

.fadeScrollbar-enter-active, .fadeScrollbar-leave-active {
  transition: opacity 0.5s;
}

.fadeScrollbar-enter, .fadeScrollbar-leave-to {
  opacity: 0;
}

#pane-header {
  height:30px;
  position:absolute;
  top:0px;
  right:4.8%;
  background-color:gray;
  z-index: 50;
  text-align: right;
  padding: 6px;
}

.toolbar-button {
  display:inline-block;
}

.headerFade-enter-active, .headerFade-leave-active {
  transition: all 0.4s;
}

.headerFade-enter, .headerFade-leave-to {
  transform: translateY(-48px);
  opacity:1;
}
</style>