<template>
  <div class="windows">
    <ul class="windows-list">
        <li v-for="window in windows" :key="window.id">
            <span :class="(window.id === current.window) ? 'selected' : ''" @click="setWindow(window.id)">{{ window.name }}</span>
        </li>
    </ul>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
    name: "windows",
    methods: {
        setWindow(id) {
            this.$store.dispatch("selectComponent", { type: 2, id });
        }
    },
    computed: {
        ...mapState(["windows", "current"])
    }
}
</script>

<style>
    .windows {
        height:5%;
        padding:2px;
        background-color: blue;
        color:gray;
    }

    .windows-list {
        list-style-type: none;
        margin: 0;
        padding: 0;
        overflow: hidden;
    }

    .windows-list li {
        float: left;
    }

    .windows-list li span {
        display: block;
        text-align: center;
        padding: 16px;
        text-decoration: none;
    }
    
    .windows-list li span:hover {
        cursor: pointer;
        text-decoration: underline;
    }

    .selected {
        font-weight: 900;
        color: white;
    }

    .selected::after {
        content: "*";
        padding-left: 3px;
    }
</style>