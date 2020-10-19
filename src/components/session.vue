<template>
  <div class="session" style="position:relative; height:100%;">
      <window></window>
  </div>
</template>

<script>
import { mapState } from "vuex";
import window from '@/components/window';

export default {
    name: 'session',
    components: { window },
    computed : {

    }
}
</script>

<style>

</style>