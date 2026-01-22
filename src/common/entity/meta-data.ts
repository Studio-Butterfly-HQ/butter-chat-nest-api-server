import { CreateDateColumn, UpdateDateColumn } from "typeorm";

export abstract class MetaData{
    @CreateDateColumn()
    createdDate: Date
    
    @UpdateDateColumn()
    updatedDate: Date
}