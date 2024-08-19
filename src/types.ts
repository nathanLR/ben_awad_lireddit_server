import { Request, Response } from "express";
import { Redis } from "ioredis";
import { EntityManager } from "typeorm";

export interface MyContext {
    em: EntityManager;
    req: Request;
    res: Response;
    redis: Redis
}

declare module "express-session" {
    interface SessionData {
        userId: number;
    }
}