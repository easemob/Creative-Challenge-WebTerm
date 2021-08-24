export declare class LRUMap<T> {
    capacity: number;
    private _map;
    private _head;
    private _tail;
    private _nodePool;
    size: number;
    constructor(capacity: number);
    private _unlinkNode;
    private _appendNode;
    prealloc(count: number): void;
    get(key: number): T | null;
    peekValue(key: number): T | null;
    peek(): T | null;
    set(key: number, value: T): void;
}
//# sourceMappingURL=LRUMap.d.ts.map