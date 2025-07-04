<!-- 人脸检测+匹配 -->
<template>
    <div class="video-container">
        <video ref="videoRef" autoplay playsinline></video>
        <canvas ref="canvasRef"></canvas>
        <div>
            <button @click="startCamera">开启摄像头</button>
            <button @click="stopCamera">关闭摄像头</button>
            <button @click="registerFace">注册当前人脸</button>
        </div>
        <div v-if="matchResult !== null">
            匹配结果: {{ matchResult ? 'True (已存在)' : 'False (新人脸)' }}
        </div>
    </div>
</template>

<script setup name="detectFace2">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as faceApi from '@vladmandic/face-api'

const videoRef = ref(null)
const canvasRef = ref(null)
const stream = ref(null)
const knownFaces = ref([]) // 存储已知人脸特征
const matchResult = ref(null) // 存储匹配结果

// 初始化人脸检测和识别模型
onMounted(async () => {
    await faceApi.nets.tinyFaceDetector.loadFromUri('/models')
    await faceApi.nets.faceRecognitionNet.loadFromUri('/models')
    await faceApi.nets.faceLandmark68Net.loadFromUri('/models')
})

// 开启摄像头
const startCamera = async () => {
    try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true
        })
        videoRef.value.srcObject = mediaStream
        stream.value = mediaStream

        await new Promise((resolve) => {
            videoRef.value.onloadedmetadata = () => resolve()
        })

        detectFaces()
    } catch (error) {
        alert('无法访问摄像头，请确保已授予权限')
    }
}

// 人脸检测和识别逻辑
const detectFaces = async () => {
    const canvas = canvasRef.value
    const context = canvas.getContext('2d')

    const detectFrame = async () => {
        const video = videoRef.value
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
        }

        // 执行人脸检测和特征提取
        const options = new faceApi.TinyFaceDetectorOptions()
        const results = await faceApi.detectAllFaces(video, options)
            .withFaceLandmarks()
            .withFaceDescriptors()

        context.clearRect(0, 0, canvas.width, canvas.height)

        if (results && results.length > 0) {
            results.forEach(result => {
                const { x, y, width, height } = result.detection.box
                context.strokeStyle = '#00ff00'
                context.lineWidth = 2
                context.strokeRect(x, y, width, height)

                // 如果有已知人脸，则进行匹配
                if (knownFaces.value.length > 0) {
                    const bestMatch = findBestMatch(result.descriptor)
                    console.log('匹配结果:', bestMatch)
                    matchResult.value = bestMatch

                    // 在检测框上方显示匹配结果
                    context.fillStyle = bestMatch ? '#00ff00' : '#ff0000'
                    context.font = '16px Arial'
                    context.fillText(bestMatch ? 'MATCHED' : 'UNKNOWN', x, y - 5)
                }
            })
        } else {
            matchResult.value = null
        }

        requestAnimationFrame(detectFrame)
    }
    requestAnimationFrame(detectFrame)
}

// 注册当前人脸
const registerFace = async () => {
    const video = videoRef.value
    const options = new faceApi.TinyFaceDetectorOptions()
    const results = await faceApi.detectAllFaces(video, options)
        .withFaceLandmarks()
        .withFaceDescriptors()

    if (results.length > 0) {
        knownFaces.value.push(results[0].descriptor)
        console.log('人脸已注册')
    } else {
        alert('未检测到人脸')
    }
}

// 查找最佳匹配
const findBestMatch = (descriptor) => {
    if (knownFaces.value.length === 0) return false

    // 计算当前人脸与所有已知人脸的欧氏距离
    const distances = knownFaces.value.map(knownDescriptor =>
        faceApi.euclideanDistance(descriptor, knownDescriptor))

    // 找出最小距离
    const minDistance = Math.min(...distances)

    // 设置阈值，小于0.6认为匹配成功（可根据需要调整）
    const threshold = 0.6
    console.log(`最小距离: ${minDistance}, 阈值: ${threshold}`)

    return minDistance < threshold
}

// 关闭摄像头
const stopCamera = () => {
    if (stream.value) {
        stream.value.getTracks().forEach(track => track.stop())
        videoRef.value.srcObject = null
        stream.value = null

        const canvas = canvasRef.value
        const context = canvas.getContext('2d')
        context.clearRect(0, 0, canvas.width, canvas.height)
    }
}

onBeforeUnmount(() => {
    stopCamera()
})
</script>

<style scoped lang="scss">
.video-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    video,
    canvas {
        width: 60%;
        aspect-ratio: 16 / 9;
        object-fit: cover;
        background: #000;
    }

    canvas {
        top: 0;
        position: absolute;
        background-color: rgba(0, 0, 0, 0);
    }
}

button {
    margin: 1rem;
    padding: 0.5rem 1rem;
    background: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}
</style>