<template>
    <div class="header" v-if="currentServer">
        {{ currentServer.name }}
        <div class="sessions">
            <label>Sessions: </label>
            <select v-model="current.session" @change="changeSession">
                <option v-for="session in sessions" :key="session.id" :value="session.id">{{ session.name }}</option>
            </select>
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";

export default {
    name: 'tmuxHeader',
    methods: {
        checker() {
            this.$socket.client.emit('checker');
        },
        changeSession(e) {
            this.$store.dispatch("selectComponent", { type: 1, id: e.target.value });
        }
    },
    computed: {
        ...mapState(['current', 'sessions']),
        ...mapGetters(['currentServer'])
    }
}
</script>

<style>
    .header {
        height:5%;
        background-color:black;
        color:white;
        font-variant: small-caps;
        font-size:1.5em;
        text-align:left;
        padding-left:20px;
    }

    .sessions {
        float:right;
        margin-right:20px;
    }
</style>