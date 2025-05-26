<!-- 导入/删除注册人脸 -->
<template>
    <div class="video-container">
        <video ref="videoRef" autoplay playsinline></video>
        <canvas ref="canvasRef"></canvas>
        <div>
            <button @click="startCamera">开启摄像头</button>
            <button @click="stopCamera">关闭摄像头</button>
            <button @click="registerFace">注册当前人脸</button>
            <button @click="loadFacesFromFiles">导入人脸图片</button>
            <button @click="clearRegisteredFaces" class="clear-btn">清除所有人脸</button>
            <input type="file" id="fileInput" multiple accept="image/*" @change="handleFileChange"
                style="display: none" />
        </div>
        <div v-if="matchResult !== null">
            匹配结果: {{ matchResult ? 'True (已存在)' : 'False (新人脸)' }}
        </div>
        <div v-if="knownFaces.length > 0">
            已注册人脸数量: {{ knownFaces.length }}
        </div>
    </div>
</template>

<script setup name="detectFace2">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as faceApi from '@vladmandic/face-api'

const videoRef = ref(null)
const canvasRef = ref(null)
const stream = ref(null)
const knownFaces = ref([])
const matchResult = ref(null)

// IndexedDB配置
const dbName = 'FaceRecognitionDB'
const storeName = 'knownFaces'

// 初始化IndexedDB
async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1)

        request.onupgradeneeded = (event) => {
            const db = event.target.result
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true })
            }
        }

        request.onsuccess = (event) => {
            resolve(event.target.result)
        }

        request.onerror = (event) => {
            reject(event.target.error)
        }
    })
}

// 保存人脸数据到IndexedDB
async function saveFacesToDB(faces) {
    const db = await initDB()
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)

    // 先清空现有数据
    await store.clear()

    // 保存新数据
    faces.forEach((face) => {
        store.add({ descriptor: Array.from(face) })
    })

    return new Promise((resolve) => {
        tx.oncomplete = () => resolve()
    })
}

// 从IndexedDB加载人脸数据
async function loadFacesFromDB() {
    try {
        const db = await initDB()
        const tx = db.transaction(storeName, 'readonly')
        const store = tx.objectStore(storeName)
        const request = store.getAll()

        return new Promise((resolve) => {
            request.onsuccess = (event) => {
                const faces = event.target.result.map(item =>
                    new Float32Array(item.descriptor))
                resolve(faces)
            }
        })
    } catch (error) {
        console.error('加载人脸数据失败:', error)
        return []
    }
}

// 清除IndexedDB中的人脸数据
async function clearFacesFromDB() {
    try {
        const db = await initDB()
        const tx = db.transaction(storeName, 'readwrite')
        const store = tx.objectStore(storeName)
        await store.clear()
        return true
    } catch (error) {
        console.error('清除人脸数据失败:', error)
        return false
    }
}

// 初始化人脸检测和识别模型
onMounted(async () => {
    await faceApi.nets.tinyFaceDetector.loadFromUri('/models')
    await faceApi.nets.faceRecognitionNet.loadFromUri('/models')
    await faceApi.nets.faceLandmark68Net.loadFromUri('/models')

    // 加载之前保存的人脸数据
    knownFaces.value = await loadFacesFromDB()
    console.log('已加载人脸数据:', knownFaces.value.length)
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

                if (knownFaces.value.length > 0) {
                    const bestMatch = findBestMatch(result.descriptor)
                    matchResult.value = bestMatch

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
    const canvas = canvasRef.value
    const context = canvas.getContext('2d')

    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const options = new faceApi.TinyFaceDetectorOptions()
    const results = await faceApi.detectAllFaces(canvas, options)
        .withFaceLandmarks()
        .withFaceDescriptors()

    if (results.length > 0) {
        knownFaces.value.push(results[0].descriptor)
        await saveFacesToDB(knownFaces.value)
        console.log('人脸已注册并保存')

        // 保存人脸图片到本地
        saveFaceImage(canvas, results[0].detection.box)
    } else {
        alert('未检测到人脸')
    }
}

// 保存人脸图片到本地
const saveFaceImage = (canvas, box) => {
    const faceCanvas = document.createElement('canvas')
    faceCanvas.width = box.width
    faceCanvas.height = box.height
    const faceCtx = faceCanvas.getContext('2d')

    faceCtx.drawImage(
        canvas,
        box.x, box.y, box.width, box.height,
        0, 0, box.width, box.height
    )

    faceCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `face_${new Date().getTime()}.jpg`
        a.click()
        URL.revokeObjectURL(url)
    }, 'image/jpeg', 0.9)
}

// 从文件导入人脸
const loadFacesFromFiles = () => {
    document.getElementById('fileInput').click()
}

const handleFileChange = async (event) => {
    const files = event.target.files
    let loadedCount = 0

    for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file.type.match('image.*')) continue

        try {
            const img = await loadImage(file)
            const descriptor = await detectFaceFromImage(img)
            if (descriptor) {
                knownFaces.value.push(descriptor)
                loadedCount++
            }
        } catch (error) {
            console.error(`处理图片 ${file.name} 时出错:`, error)
        }
    }

    if (loadedCount > 0) {
        await saveFacesToDB(knownFaces.value)
        alert(`成功导入 ${loadedCount} 张人脸图片`)
    }
}

// 清除所有已注册的人脸
const clearRegisteredFaces = async () => {
    if (knownFaces.value.length === 0) {
        alert('当前没有已注册的人脸')
        return
    }

    if (confirm('确定要清除所有已注册的人脸数据吗？此操作不可撤销！')) {
        const success = await clearFacesFromDB()
        if (success) {
            knownFaces.value = []
            matchResult.value = null
            alert('已清除所有注册的人脸数据')
        } else {
            alert('清除人脸数据失败，请重试')
        }
    }
}

const loadImage = (file) => {
    return new Promise((resolve, reject) => {
        const img = new Image()
        const url = URL.createObjectURL(file)
        img.onload = () => {
            URL.revokeObjectURL(url)
            resolve(img)
        }
        img.onerror = reject
        img.src = url
    })
}

const detectFaceFromImage = async (img) => {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)

    const options = new faceApi.TinyFaceDetectorOptions()
    const results = await faceApi.detectAllFaces(canvas, options)
        .withFaceLandmarks()
        .withFaceDescriptors()

    return results.length > 0 ? results[0].descriptor : null
}

// 查找最佳匹配
const findBestMatch = (descriptor) => {
    if (knownFaces.value.length === 0) return false

    const distances = knownFaces.value.map(knownDescriptor =>
        faceApi.euclideanDistance(descriptor, knownDescriptor))

    const minDistance = Math.min(...distances)
    const threshold = 0.6

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

    &.clear-btn {
        background: #ff4d4f;
    }
}
</style>