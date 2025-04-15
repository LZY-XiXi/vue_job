<template>
    <div class="dialogBox-container">
        <div id="chat-container">
            <div v-for="(dialogue, index) in dialogueList" :key="index" :class="['message', dialogue.role]">
                <Markdown :content="dialogue.content" />
            </div>
        </div>

        <!-- 分割线 -->
        <div style="width: 100%; height: 2px; background-color: rgba(0, 0, 0, 0.5);" />

        <div class="input-container">
            <div class="utilsBox">
                <img v-for="(util, index) in inputBox_utils" :key="index" :src="util.img" :title="util.name"
                    @click="dialogueUtils(util.text)">
            </div>
            <div class="inputBox">
                <textarea placeholder="请输入内容" v-model="inputDialogue" @keydown="handleKeyDown" />
                <div class="sendBtn" @click="handleSendMsg">
                    发送
                </div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts" name="DialogBox">
import type { Ref } from 'vue';
import type { OllamaUtilsIcon } from '@/types/ollamaTypes';
import { ref, inject, onMounted } from 'vue';
import useOllamaDialogue from '@/hooks/ollama/useOllamaDialogue';
import { getInputBoxUtilsIcon } from '@/utils/ollamaUitls';
import Markdown from './Markdown.vue';


const serviceAddress = inject<Ref<string>>('serviceAddress', ref(''));
const selectModel = inject<Ref<string>>('selectModel', ref(''));

const inputDialogue = ref<string>('');
const { dialogueList, sendMsg, dialogueUtils } = useOllamaDialogue();

function handleSendMsg() {
    if (!inputDialogue.value.trim() || !selectModel.value.trim()) return;
    sendMsg(serviceAddress.value, selectModel.value, inputDialogue.value);
    inputDialogue.value = '';
}

function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
        if (!event.shiftKey) {
            event.preventDefault();
            handleSendMsg();
        }
    }
}

let inputBox_utils = ref<OllamaUtilsIcon[]>([]);
onMounted(() => {
    getInputBoxUtilsIcon().then((res) => {
        inputBox_utils.value = res;
    });
})
</script>

<style scoped lang="scss">
.dialogBox-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin: 0.5rem;
    border-radius: 1rem;
    border: 3px solid rgba(0, 0, 0, 0.5);
    overflow: hidden;
}

#chat-container {
    width: 100%;
    height: 80%;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    gap: 1rem;

    .message {
        max-width: 60%;
        padding: 0 1rem;
        margin: 1rem;
        border-radius: 0.5rem;
        word-wrap: break-word;

        &.user {
            align-self: flex-end;
            border: 3px solid rgba(255, 0, 0, 0.5);
        }


        &.assistant {
            align-self: flex-start;
            border: 3px solid rgba(0, 0, 255, 0.5);
            color: rgba(255, 255, 255, 0.8);
            background-color: rgba(0, 0, 0, 0.6);
        }

    }
}


.input-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0.5rem;
    position: relative;

    .utilsBox {
        width: 100%;
        height: 15%;
        display: flex;
        position: relative;
        gap: 1rem;

        img {
            height: 100%;
            object-fit: cover;
        }
    }

    .inputBox {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 1rem;

        textarea {
            width: 90%;
            height: 70%;
            border-radius: 0.3rem;
            font-size: 1rem;
            padding: 0.5rem;
            resize: none;
            border: 3px solid black;
        }

        .sendBtn {
            width: 5rem;
            height: 2.5rem;
            border-radius: 0.5rem;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            border: 3px solid black;

            &:hover {
                background-color: rgba(0, 0, 0, 0.3);
            }
        }
    }


}
</style>
