<template>
    <div class="md-container" ref="container" v-html="parsedContent" />
</template>

<script setup lang="ts">
import { ref, watchEffect, onMounted } from 'vue';
import { Marked, Renderer } from '@ts-stack/markdown';
import hljs from 'highlight.js';
import 'highlight.js/scss/github-dark.scss'

const { content } = defineProps({
    content: {
        type: String,
        required: true,
    },
});

const container = ref<HTMLElement | null>(null);
const parsedContent = ref('');

// 自定义渲染器，处理代码块
const myRenderer = new Renderer();
myRenderer.code = function (code: string, language: string) {
    const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `
        <div class="code-block">
            <div class="code-header">
                <span class="language">${language || 'plaintext'}</span>
                <button class="copy-button" data-code="${escapedCode}">复制代码</button>
            </div>
            <pre><code class="language-${language}">${escapedCode}</code></pre>
        </div>
    `;
};

// 解析 Markdown 内容
watchEffect(() => {
    Marked.setOptions({
        renderer: myRenderer,
        highlight: (code, lang) => hljs.highlightAuto(code, [lang as string]).value
    });
    // Marked.setOptions({ renderer: myRenderer });
    parsedContent.value = Marked.parse(content);
});

// 复制代码功能
function copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
        alert('代码已复制到剪贴板');
    }).catch(() => {
        alert('复制失败，请手动复制');
    });
}

// 手动绑定复制按钮的点击事件
onMounted(() => {
    if (container.value) {
        container.value.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            if (target.classList.contains('copy-button')) {
                const code = target.getAttribute('data-code');
                if (code) {
                    copyCode(code);
                }
            }
        });
    }

    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block as HTMLElement);
    });
});
</script>

<style scoped lang="scss">
.md-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    &:deep(pre) {
        padding: 0.3rem;
        border-radius: 0.5rem;
        background-color: rgba(40, 44, 52, 0.5);
        font-size: 1rem;
        color: #abb2bf;
        overflow-x: auto;
    }

    &:deep(h1, h2, h3, h4, h5, h6) {
        margin: 0.5rem 0;
        font-weight: bold;
    }

    &:deep(p) {
        margin: 0.5rem 0;
        line-height: 1.5;
    }

    &:deep(ul),
    &:deep(ol) {
        margin: 0.5rem 0;
        padding-left: 1.5rem;
    }

    &:deep(a) {
        color: #42b983;
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }

    &:deep(blockquote) {
        margin: 0.5rem 0;
        padding: 0.5rem 1rem;
        border-left: 4px solid #42b983;
        background-color: rgba(66, 185, 131, 0.1);
        color: #666;
    }

    &:deep(.code-block) {
        margin: 0.5rem 0;
        border-radius: 0.5rem;
        background-color: rgba(40, 44, 52, 0.5);

        .code-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem;
            background-color: rgba(40, 44, 52, 0.8);
            border-radius: 0.5rem 0.5rem 0 0;

            .language {
                font-size: 0.9rem;
                color: #abb2bf;
            }

            .copy-button {
                background-color: #42b983;
                color: white;
                border: none;
                padding: 0.3rem 0.5rem;
                border-radius: 0.3rem;
                cursor: pointer;
                font-size: 0.9rem;

                &:hover {
                    background-color: #3aa876;
                }
            }
        }

        pre {
            margin: 0;
            border-radius: 0 0 0.5rem 0.5rem;
        }
    }
}
</style>