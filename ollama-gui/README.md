# ollama-gui

本项目为使用vue+vite+ts+scss实现的ollama对话可视化工具。
个人使用，功能不多也比较简单，仅满足简单对话。

## 如何使用

1. 可以选择直接下载仓库，然后下载依赖即可运行。
``` sh
    git clone https://github.com/LZY-XiXi/ollama-gui.git
    cd ollama-gui
    pnpm i
    pnpm dev
```

2. 也可以使用已经打包好的exe文件，作用一致，使用electron进行打包。


## 具体使用
1. 运行成功后，可以看到项目左侧可以输入ollama服务的地址，默认为`http://127.0.0.1:11434`，可以修改为其他ollama服务器的地址。修改完成后，只要地址正确，且正常运行了ollama服务，并已经下载好模型，即可在下方选择存在的模型进行对话。
2. 在对话框选择输入想要的对话内容，回车或点击发送即可发送信息，等待ollama服务返回结果即可。（若想回车，则使用shift+enter）。
3. 在对话框上方有三个按键——`清空对话`，`导入对话`，`导出对话`
4. 对于代码块，可以直接复制代码内容。


## 当前存在的问题：
1. 未实现中断对话的功能
2. 未实现多个对话窗口
3. 部分时候会出现对话发送过去后，没有返回结果的情况。
4. 添加了markdown渲染，但渲染存在部分问题。
