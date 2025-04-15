<template>
    <div class="app-container">
        <SideBar />
        <DialogBox />
    </div>
</template>

<script setup lang="ts" name="App">
import { ref, provide } from 'vue';
import SideBar from './components/SideBar.vue';
import DialogBox from './components/DialogBox.vue';

provide('serviceAddress', ref<string>(''));
provide('selectModel', ref<string>(''));

</script>

<style scoped lang="scss">
.app-container {
    width: 100%;
    height: 100vh;
    border-radius: 0.5rem;
    display: flex;
    position: relative;
}
</style>
