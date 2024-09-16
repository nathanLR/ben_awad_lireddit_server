import { Request, Response } from "express";
import { Redis } from "ioredis";
import { EntityManager } from "typeorm";
import { createVoteStatusLoader } from "./utils/dataloaderFields";

export interface MyContext {
    em: EntityManager;
    req: Request;
    res: Response;
    redis: Redis,
    voteStatusLoader: ReturnType<typeof createVoteStatusLoader>
}

declare module "express-session" {
    interface SessionData {
        userId: number;
    }
}