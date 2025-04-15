import { ref } from "vue";
import type { Dialogue, OllamaModel } from "@/types/ollamaTypes";

export const fetchModels = async (serviceAddress: string): Promise<OllamaModel[]> => {
    try {
        const response = await fetch(`${serviceAddress}/api/tags`)
        const modelsData = await response.json()

        return modelsData.models || []

    } catch (error) {
        console.error('获取模型失败:', error)
        return []
    }
}

const controller = ref<AbortController>()
export const exchangeMsg = async (serviceAddress: string, selectedModel: string, messages: Dialogue[]) => {
    try {
        controller.value = new AbortController()
        const response = await fetch(`${serviceAddress}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: selectedModel,
                messages: messages,
                stream: true
            }),
            signal: controller.value.signal
        })

        if (!response.ok) {
            throw new Error(`请求失败，状态码：${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('无法获取 ReadableStreamDefaultReader');
        }

        return reader;

    } catch (error) {
        console.error('请求错误:', error);
        throw error;
    }
}