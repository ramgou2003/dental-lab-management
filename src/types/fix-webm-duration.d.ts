declare module 'fix-webm-duration' {
    export default function (blob: Blob, duration: number, callback: (blob: Blob) => void): void;
}
