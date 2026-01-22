import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Job } from "bullmq";

@Processor('messenger')
export class BullMQMessengerProcessor extends WorkerHost{
   async process(job: Job<any, any, string>):Promise<any>{
      console.log(job.data)
      return {}
   }
}