import { Observable, share } from 'rxjs'

export type EventsMap = Record<string, any>

export interface EventListener {
  next(data: unknown): void
  error(error: unknown): void
}

export abstract class BaseEventBus<Events extends EventsMap = EventsMap> {
  private observables = new Map<string, Observable<any>>()

  abstract emit<K extends keyof Events & string>(name: K, data: Events[K]): Promise<void>

  /**
   * Starts listening to the event and returns a function that stops it.
   * Called once per event name while it has at least one subscriber.
   */
  protected abstract listen(name: string, listener: EventListener): () => void

  on<K extends keyof Events & string>(name: K): Observable<Events[K]> {
    let observable = this.observables.get(name)
    if (!observable) {
      observable = new Observable<Events[K]>(subscriber =>
        this.listen(name, {
          next: data => subscriber.next(data as Events[K]),
          error: error => subscriber.error(error),
        }),
      ).pipe(share())
      this.observables.set(name, observable)
    }
    return observable
  }
}
