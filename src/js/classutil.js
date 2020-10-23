export class ThreadPool {
  constructor(max) {
    this.max = max ? max : 20
  }

  async submitList(runnableList){
    let splitChunks = [];
    for(let i = 0;i < runnableList.length;){
        splitChunks.push(runnableList.splice(i, this.max))
         if(i + this.max > runnableList.length){
           splitChunks.push(runnableList.splice(i, runnableList.length - i))
           i += this.max;
         }
    }
    for(let chunk of splitChunks) {
      await Promise.race(chunk)
    }
  }

}
