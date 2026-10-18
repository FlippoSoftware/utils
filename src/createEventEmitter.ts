export type EventMap = Record<string, unknown>;

export class EventEmitter<T extends EventMap> {
    private map;

    constructor() {
        this.map = new Map<keyof T, Set<(data: unknown) => void>>();
    }

    /**
     * Subscribes a listener to an event.
     * @param event - The event name.
     * @param listener - The handler.
     * @returns A function that unsubscribes this listener.
     */
    public on<K extends keyof T>(event: K, listener: (data: T[K]) => void): () => void {
        if (!this.map.has(event)) {
            this.map.set(event, new Set());
        }

        const listeners = this.map.get(event)!;
        // The cast is safe: `emit` passes the data of this event.
        listeners.add(listener as (data: unknown) => void);

        // The cleanup function unsubscribes the listener.
        return () => this.off(event, listener);
    }

    /**
     * Unsubscribes a listener from an event.
     * @param event - The event name.
     * @param listener - The handler to remove.
     */
    public off<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
        this.map.get(event)?.delete(listener as (data: unknown) => void);
    }

    /**
     * Emits an event: calls all of its listeners.
     * @param event - The event name.
     * @param data - The data passed to the listeners.
     */
    public emit<K extends keyof T>(event: K, data: T[K]): void {
        this.map.get(event)?.forEach((listener) => {
            // `data` is of type T[K] and `listener` takes `unknown`:
            // any type can be passed as `unknown`, so this is safe.
            listener(data);
        });
    }

    /**
     * Subscribes a one-time listener: it is removed after its first call.
     * @param event - The event name.
     * @param listener - The handler.
     * @returns A function that unsubscribes this listener before it is called.
     */
    public once<K extends keyof T>(event: K, listener: (data: T[K]) => void): () => void {
        const removeListener = this.on(event, (data) => {
            // Unsubscribe first, then call the original listener.
            removeListener();
            listener(data);
        });
        return removeListener;
    }

    /**
     * Removes all the listeners of an event, or of every event when no name is given.
     * @param event - The event name (optional).
     */
    public removeAllListeners<K extends keyof T>(event?: K): void {
        if (event) {
            this.map.delete(event);
        } else {
            this.map.clear();
        }
    }
}
