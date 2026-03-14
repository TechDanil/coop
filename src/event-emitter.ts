export type Event = "data" | "error"

export type DataResult<Value = unknown, Result = unknown> = { done: false; value: Value } | { done: true; value: Result }

export type ErrorResult<Error = unknown> = { done: true; error: Error; value: undefined }

export type DataHandler<Value, Result> = (data: DataResult<Value, Result>) => void

export type ErrorHandler<Error> = (error: Error) => void

export class EventEmitter<Value = unknown, Result = unknown, Error = unknown> {
  #handlers = {
    data: new Set<DataHandler<Value, Result>>(),
    error: new Set<ErrorHandler<Error>>()
  }

  #done = false;
  #promise: PromiseWithResolvers<DataResult<Value, Result>> | null = null;

  [Symbol.asyncIterator]() {
    return {
      [Symbol.asyncIterator]() {
        return this
      },

      next: () => {

        if (this.#promise != null) {
          return this.#promise.promise
        }

        if (this.#done) {
          return Promise.resolve({ done: true, value: undefined })
        }

        this.#promise = Promise.withResolvers();

        const cleanup = () => {
          this.off('data', onData)
          this.off('error', onError)
        }

        const onData = (data: DataResult<Value, Result>) => {
          cleanup()

          const promise = this.#promise!
          this.#promise = null

          promise.resolve(data)
        }

        const onError = (error: ErrorResult<Error>) => {
          cleanup()

          const promise = this.#promise!
          this.#promise = null

          promise.reject(error)
        }
      }
    }
  }

  on(event: "data", handler: DataHandler<Value, Result>): void
  on(event: "error", handler: ErrorHandler<Error>): void
  on(event: Event, handler: DataHandler<Value, Result> | ErrorHandler<Error>) {
    this.#getStore(event).add(handler)
  }


  off(event?: Event, handler?: Function) {
    if (event == null) {
      this.off('data', handler)
      this.off('error', handler)
      return
    }

    const store = this.#getStore(event)

    if (handler == null) {
      store.clear()
    } else {
      store.delete(handler)
    }
  }

  emit(event: "data", data: DataResult<Value, Result>): void
  emit(event: "error", error: Error): void
  emit(event: Event, payload: DataResult<Value, Result> | Error) {
    this.#getStore(event).forEach(handler => {
      handler(payload)
    })
  }

  #getStore(event: Event): Set<Function> {
    return event === "data" ? this.#handlers.data : this.#handlers.error
  }
}