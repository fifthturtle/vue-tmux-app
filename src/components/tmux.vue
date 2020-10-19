<template>
  <div class="tmux">
    <tmuxHeader></tmuxHeader>
      <window></window>
      <windows></windows>
  </div>
</template>

<script>
import window from '@/components/window';
import windows from '@/components/windows';
import tmuxHeader from '@/components/tmuxHeader';

export default {
    name: 'tmux',
    components: {
      window,
      windows,
      tmuxHeader
    }
}
</script>

<style>
.tmux {
  position: relative;
  height:100%;
}
</style>