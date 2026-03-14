import type { IScheduler } from "#scheduler.ts"
import type { EventEmitter, DataHandler, ErrorHandler } from "#event-emitter.ts";

export interface ITaskHelper {
  shouldPause(): boolean
}

export type TaskHelperConstructor = new (scheduler: IScheduler) => ITaskHelper

export type TaskBuilder =
  (scheduler: IScheduler) =>
    <Helper extends TaskHelperConstructor>(TaskHelper: Helper) =>
      <Function extends (taskHelper: InstanceType<Helper>, ...args: any) => IterableIterator<any>>(fn: Function) =>
        (...args: ts.Pop<Parameters<Function>>) => any extends (...args: any) => IterableIterator<infer Value, infer Result> ?
          EventablePromise<Promise<Result>, Value> :
          EventablePromise<Promise<unknown>>;

interface AsyncIterable<TValue, TReturn = unknown, TNext = unknown> {
  [Symbol.asyncIterator](): AsyncIterableIterator<TValue, TReturn, TNext>;
}

export type EventablePromise<EventPromise extends Promise<any>, Value = Awaited<EventPromise>> = Omit<EventPromise, "catch"> & {
  on(event: "data", handler: DataHandler<Value, Awaited<EventPromise>>): EventPromise
  on(event: "error", handler: ErrorHandler<Error>): EventPromise
  off(...args: Parameters<EventEmitter<unknown, unknown>['off']>): EventPromise
  catch<TValue = never>(onRejected?: ((reason: string) => TValue | PromiseLike<TValue>) | undefined | null): EventablePromise<Promise<Awaited<EventPromise> | TValue>>;
} & AsyncIterable<Value, Awaited<EventPromise>>