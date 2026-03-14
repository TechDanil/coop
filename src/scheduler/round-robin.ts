import type { IScheduleOptions, IScheduler, JobResult } from "./types";

export class RoundRobinScheduler implements IScheduler {
  #running = false

  readonly #queue: Function[] = []

  readonly #quota: number
  readonly #delay: number

  get quota() {
    return this.#quota
  }

  get delay() {
    return this.#delay
  }

  constructor(option: IScheduleOptions) {
    this.#quota = option.quota
    this.#delay = option.delay
  }

  isRunning = () => this.#running;

  clear() {
    this.#running = false;
    this.#queue.splice(0, this.#queue.length);
  }

  push(job: IterableIterator<unknown>, handler: (result: JobResult) => void) {
    const worker = () => {
      try {
        const result = job.next() as JobResult

        if (!result.done) {
          this.#queue.push(worker)
        }

        handler(result)

      } catch (error) {
        handler({ done: true, error, value: undefined })
      }
    }

    this.#queue.push(worker)
    this.run()

    return this.#queue.length
  }

  run() {
    if (this.#running) {
      return
    }

    this.#running = true

    let now = 0

    const run = () => {
      if (!this.#running) {
        return
      }

      const job = this.#queue.shift()

      if (job == null) {
        this.#running = false
        return
      }

      now ||= performance.now()

      job()

      if (performance.now() - now >= this.#quota) {
        now = 0
        setTimeout(run, this.#delay);
      } else {
        run()
      }
    }

    queueMicrotask(run)
  }
}