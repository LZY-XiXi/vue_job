import getAssetsImages from '@/assets/images';
import type { OllamaUtilsIcon } from '@/types/ollamaTypes';

// export const inputBox_utils: OllamaUtilsIcon[] = [
//     {
//         img: clearImg,
//         name: '清空对话',
//         text: 'clear',
//     },
//     {
//         img: importImg,
//         name: '导入对话',
//         text: 'import',
//     },
//     {
//         img: exportImg,
//         name: '导出对话',
//         text: 'export',
//     }
// ]

export const getInputBoxUtilsIcon = async (): Promise<OllamaUtilsIcon[]> => {
    const { clearImg, importImg, exportImg } = await getAssetsImages();
  
    return [
      {
        img: clearImg,
        name: '清空对话',
        text: 'clear',
      },
      {
        img: importImg,
        name: '导入对话',
        text: 'import',
      },
      {
        img: exportImg,
        name: '导出对话',
        text: 'export',
      }
    ];
  };
