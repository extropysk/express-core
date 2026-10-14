import { MemoryEventBus } from '@/events/memory'
import { describe, it, expect, vi } from 'vitest'

interface TestEvents {
  created: { id: string }
  deleted: { id: string }
}

describe('MemoryEventBus', () => {
  it('should deliver event to all subscribers of given name', async () => {
    const bus = new MemoryEventBus<TestEvents>()
    const first = vi.fn()
    const second = vi.fn()
    const other = vi.fn()

    bus.on('created').subscribe(first)
    bus.on('created').subscribe(second)
    bus.on('deleted').subscribe(other)

    await bus.emit('created', { id: '1' })

    expect(first).toHaveBeenCalledWith({ id: '1' })
    expect(second).toHaveBeenCalledWith({ id: '1' })
    expect(other).not.toHaveBeenCalled()
  })

  it('should not deliver event after unsubscribe', async () => {
    const bus = new MemoryEventBus<TestEvents>()
    const handler = vi.fn()

    bus.on('created').subscribe(handler).unsubscribe()
    await bus.emit('created', { id: '1' })

    expect(handler).not.toHaveBeenCalled()
  })

  it('should listen once per event name and stop after last unsubscribe', async () => {
    const bus = new MemoryEventBus<TestEvents>()
    const listen = vi.spyOn(bus as any, 'listen')
    const handler = vi.fn()

    const first = bus.on('created').subscribe(handler)
    const second = bus.on('created').subscribe()
    expect(listen).toHaveBeenCalledTimes(1)

    first.unsubscribe()
    second.unsubscribe()
    await bus.emit('created', { id: '1' })
    expect(handler).not.toHaveBeenCalled()

    bus.on('created').subscribe(handler)
    await bus.emit('created', { id: '2' })
    expect(listen).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenCalledWith({ id: '2' })
  })
})
