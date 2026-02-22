declare module 'rrweb-player' {
    export default class rrwebPlayer {
        constructor(options: any);
        play(): void;
        pause(): void;
        toggle(): void;
        goto(timeOffset: number): void;
        destroy(): void;
    }
}
