import "reflect-metadata";
import { DataSource } from "typeorm";
import "dotenv/config";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { PostMigration1722704129595 } from "../migrations/1722704129595-PostMigration";

const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: Number(process.env.PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Post],
    migrationsTableName: "lirredit_server_migrations",
    migrations: [PostMigration1722704129595], 
    synchronize: false,
    logging: !__prod__
});

const em = AppDataSource.manager;

export {AppDataSource, em};