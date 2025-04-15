export interface Dialogue {
    role: 'user' | 'assistant',
    content: string;
}

export interface OllamaUtilsIcon {
    img: string,
    name: string,
    text: string,
}

export interface OllamaModel {
    name: string,
    size: number,
}