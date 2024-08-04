import { Request, Response } from "express";
import { EntityManager } from "typeorm";

export interface MyContext {
    em: EntityManager;
    req: Request;
    res: Response
}

declare module "express-session" {
    interface SessionData {
        userId: number;
    }
}