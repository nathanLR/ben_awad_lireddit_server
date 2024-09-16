import "reflect-metadata";
import { DataSource } from "typeorm";
import "dotenv/config";
import { __prod__ } from "./constants";
import { Post, Upvote, User } from "./entities";
import { NewestChanges1726429609717 } from "../migrations/1726429609717-newestChanges";

const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: Number(process.env.PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Post, User, Upvote],
    migrationsTableName: "lirredit_server_migrations",
    migrations: [NewestChanges1726429609717],
    synchronize: false,
    logging: !__prod__
});

export default AppDataSource;