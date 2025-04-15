import { ref } from "vue"
import { fetchModels } from "@/apis/ollamaApi";
import type { OllamaModel } from "@/types/ollamaTypes";

export default () => {

    const modelList = ref<OllamaModel[]>([]);
    const updateModelList = (serviceAddress:string) => {
        if (serviceAddress) {
            localStorage.setItem('serviceAddress', serviceAddress);
            fetchModels(serviceAddress).then((models) => {
                modelList.value = models;
            }).catch((error) => {
                console.error('更新模型列表失败:', error);
            });
        }

    };

    return {
        modelList,
        updateModelList
    }
}