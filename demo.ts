import { SimpleTaskHelper } from './src/task/helper/simple';
import { RoundRobinScheduler } from './src/scheduler/round-robin';
import { taskBuilder } from './src/task';

const task = taskBuilder(new RoundRobinScheduler({ quota: 300, delay: 50 }))(SimpleTaskHelper)

const exec = task(function* doSomething(time, quota: number) {
  let data: number[] = []

  for (let index = 0; index < quota; index++) {
    data.push(index)

    if (time.shouldPause()) {
      yield data
      data = []
    }
  }

  if (data.length > 0) {
    yield data
  }

  return "done"
})

setInterval(() => {
  console.log("ha");
}, 10);

(async () => {
  try {
    for await (const data of exec(10000000).catch(console.error)) {
      console.log(data)
    }
  } catch (error) {
    console.log(1111, error);
  }
})()