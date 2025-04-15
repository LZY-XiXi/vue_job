// export const clearImg = (await import('./clear.png')).default;
// export const importImg = (await import('./import.png')).default;
// export const exportImg = (await import('./export.png')).default;

export default async () => {
    const clearImg = (await import('./clear.png')).default;
    const importImg = (await import('./import.png')).default;
    const exportImg = (await import('./export.png')).default;

    return { clearImg, importImg, exportImg };
};