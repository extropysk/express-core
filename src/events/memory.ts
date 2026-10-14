import { BaseEventBus, EventListener, EventsMap } from '@/events/base'

export class MemoryEventBus<Events extends EventsMap = EventsMap> extends BaseEventBus<Events> {
  private listeners = new Map<string, EventListener>()

  async emit<K extends keyof Events & string>(name: K, data: Events[K]): Promise<void> {
    this.listeners.get(name)?.next(data)
  }

  protected listen(name: string, listener: EventListener) {
    this.listeners.set(name, listener)
    return () => {
      this.listeners.delete(name)
    }
  }
}
