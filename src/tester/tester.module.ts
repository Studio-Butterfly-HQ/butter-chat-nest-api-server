import { Module } from "@nestjs/common";
import { TesterController } from "./tester.controller";

@Module(
    {
        imports:[],
        controllers:[TesterController],
        providers:[]
    }
)
export class TesterModule{}