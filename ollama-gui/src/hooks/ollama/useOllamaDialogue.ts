import { ref } from "vue"
import type { Dialogue } from "@/types/ollamaTypes"
import { exchangeMsg } from "@/apis/ollamaApi"


export default () => {
    const dialogueList = ref<Dialogue[]>([])
    const sendMsg = async (serviceAddress: string, model: string, inputDialogue: string): Promise<void> => {
        dialogueList.value.push({
            role: 'user',
            content: inputDialogue
        })
        dialogueList.value.push({
            role: 'assistant',
            content: '正在思考中...'
        })

        const reader = await exchangeMsg(
            serviceAddress,
            model,
            dialogueList.value
        )

        const decoder = new TextDecoder()
        let assistantMessage = ''
        while (true) {
            const chatWindow = document.getElementById('chat-container');
            if (chatWindow) {
                chatWindow.scrollTo({
                    top: chatWindow.scrollHeight,
                    behavior: 'smooth' // 可选，使滚动平滑
                });
            }

            const { done, value } = await reader.read()
            if (done) break;

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')

            for (const line of lines) {
                if (line.trim()) {
                    const parsed = JSON.parse(line)
                    assistantMessage += parsed.message?.content || ''
                }
            }

            // 更新模型回答
            dialogueList.value.splice(-1, 1, {
                role: 'assistant',
                content: assistantMessage
            })
        }
    }

    function dialogueUtils(utilSelect: string) {
        if (utilSelect === 'clear') {
            dialogueList.value = []
        }
        else if (utilSelect === 'import') {
            // 创建文件选择输入框
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json'; // 限制文件类型为JSON

            input.onchange = (event) => {
                const file = (event.target as HTMLInputElement).files?.[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const json = JSON.parse(e.target?.result as string);
                            dialogueList.value = json; // 更新对话列表
                        } catch (error) {
                            console.error('解析JSON文件失败', error);
                        }
                    };
                    reader.readAsText(file); // 读取文件内容
                }
            };

            input.click(); // 触发文件选择对话框
        }
        else if (utilSelect === 'export') {
            const dataStr = JSON.stringify(dialogueList.value, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'dialogues.json';
            a.click();
            URL.revokeObjectURL(url);
        }
    }

    return {
        dialogueList,
        sendMsg,
        dialogueUtils,
    }
}