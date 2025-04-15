<template>
    <div class="sideBar-container">
        <!-- 标题 -->
        <div class="brand">
            <img src="/ollama.png">
            <p>Ollama Gui</p>
        </div>

        <!-- 模型选择 -->
        <div class="select-container">
            <p>服务器地址: </p>
            <input type="text" v-model="serviceAddress" @change="() => { updateModelList(serviceAddress) }">
            <p>模型选择: </p>
            <select v-model="selectModel">
                <option v-for="(model, index) in modelList" :key="index" :value="model.name">{{ model.name }}</option>
            </select>
        </div>
    </div>
</template>

<script setup lang="ts" name="SideBar">
import type { Ref } from 'vue';
import { ref, inject, onMounted } from 'vue';

import useOllamaModel from '@/hooks/ollama/useOllamaModel';

const serviceAddress = inject<Ref<string>>('serviceAddress', ref(''));
const selectModel = inject<Ref<string>>('selectModel', ref(''));

const { modelList, updateModelList } = useOllamaModel();

onMounted(() => {
    serviceAddress.value = localStorage.getItem('serviceAddress') || 'http://127.0.0.1:11434';
    updateModelList(serviceAddress.value);
})

</script>

<style scoped lang="scss">
.sideBar-container {
    width: 15rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    background-color: rgba(200, 200, 200, 0.5);
}

.brand {
    width: 90%;
    height: 8%;
    margin: 1rem 0;
    display: flex;
    align-items: end;

    img {
        width: 2.5rem;
        height: 2.5rem;
        margin-left: 1rem;
    }

    p {
        margin: 0 0.5rem;
        font-size: 1.3rem;
    }
}

.select-container {
    width: 90%;
    height: 10%;
    margin: 0.3rem 0;
    padding: 0.5rem 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;

    p {
        align-self: flex-start;
        font-size: 1rem;
        font-weight: 500;
    }

    input {
        width: 100%;
        height: 30%;
        margin-bottom: 1rem;
        text-align: center;
        border: 1px solid rgba(0, 0, 0, 0.5);
        font-size: 1rem;
    }

    select {
        width: 100%;
        height: 35%;
        padding: 0 0.1rem;
        font-size: 1rem;
        text-align: center;
        cursor: pointer;

        option {
            font-size: 1rem;
            overflow-x: hidden;
        }
    }
}
</style>
