import type { IScheduler } from "#scheduler";
import type { ITaskHelper } from "#task/types";

export class SimpleTaskHelper implements ITaskHelper {
  protected time = 0

  protected scheduler: IScheduler;

  constructor(scheduler: IScheduler) {
    this.scheduler = scheduler
  }

  shouldPause() {
    this.time ||= performance.now()

    if (performance.now() - this.time > this.scheduler.quota / 4) {
      this.time = 0
      return true
    }

    return false
  }
}