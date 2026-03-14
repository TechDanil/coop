import type { DataResult, ErrorResult } from "#event-emitter"

export type JobResult = DataResult | ErrorResult

export interface IScheduleOptions {
  quota: number
  delay: number
}

export interface IScheduler {
  get quota(): number
  get delay(): number
  isRunning(): boolean
  run(): void
  clear(): void
  push(job: IterableIterator<unknown>, handler: (result: JobResult) => void): number
}