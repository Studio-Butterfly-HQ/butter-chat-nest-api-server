import { Controller, Get, Req, Session } from "@nestjs/common";

@Controller('tester')
export class TesterController{
    @Get('session')
    async sessionTester(@Session() session:any, @Req() req: any){
        console.log("session: ",session)
        return session
    }
}