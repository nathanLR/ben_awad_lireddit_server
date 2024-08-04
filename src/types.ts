import { EntityManager } from "typeorm";

export interface MyContext {
    token: String;
    em: EntityManager;
}