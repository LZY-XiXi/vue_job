<!-- 人脸检测 -->
<template>
    <div class="video-container">
        <video ref="videoRef" autoplay playsinline></video>
        <canvas ref="canvasRef"></canvas>
        <div>
            <button @click="startCamera">开启摄像头</button>
            <button @click="stopCamera">关闭摄像头</button>
        </div>
    </div>
</template>

<script setup name="detectFace1">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as faceApi from '@vladmandic/face-api'

const videoRef = ref(null) // video 元素的引用
const canvasRef = ref(null) // canvas 元素的引用
const stream = ref(null) // 媒体流

// 初始化人脸检测模型
onMounted(async () => {
    await faceApi.nets.tinyFaceDetector.loadFromUri('/models')
})

// 开启摄像头
const startCamera = async () => {
    try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true
        })
        videoRef.value.srcObject = mediaStream
        stream.value = mediaStream

        // 等待视频元数据加载
        await new Promise((resolve) => {
            videoRef.value.onloadedmetadata = () => resolve()
        })

        // 开始人脸检测
        detectFaces()
    } catch (error) {
        alert('无法访问摄像头，请确保已授予权限')
    }
}

// 人脸检测逻辑
const detectFaces = async () => {
    const canvas = canvasRef.value
    const context = canvas.getContext('2d')

    const detectFrame = async () => {

        // 调整画布尺寸匹配视频
        const video = videoRef.value
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
        }

        // 执行人脸检测
        const options = new faceApi.TinyFaceDetectorOptions()
        const results = await faceApi.detectAllFaces(video, options)

        // 清除上一帧画布
        context.clearRect(0, 0, canvas.width, canvas.height)

        // 绘制检测结果
        if (results && results.length > 0) {
            // faceApi.draw.drawDetections(canvas, results) // face-api自带绘制方法(带执行度)
            results.forEach(result => {
                const { x, y, width, height } = result.box
                context.strokeStyle = '#00ff00' // 框线颜色
                context.lineWidth = 2            // 线宽
                context.strokeRect(x, y, width, height)
            }) // 自定义绘制方法(不带执行度)

        }
        // 持续检测
        requestAnimationFrame(detectFrame)
    }
    requestAnimationFrame(detectFrame)
}

// 关闭摄像头
const stopCamera = () => {
    if (stream.value) {
        stream.value.getTracks().forEach(track => track.stop())
        videoRef.value.srcObject = null
        stream.value = null

        // 清空画布
        const canvas = canvasRef.value
        const context = canvas.getContext('2d')
        context.clearRect(0, 0, canvas.width, canvas.height)
    }
}

// 组件卸载时清理
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
        background-color: rgba(0, 0, 0, 0.5);
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