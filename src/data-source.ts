import "reflect-metadata";
import { DataSource } from "typeorm";
import "dotenv/config";
import { __prod__ } from "./constants";
import { Post, Upvote, User } from "./entities";
import { PostPlaceholder1725110085440 } from "../migrations/1725110085440-PostPlaceholder";
import { Upvote1725475949196 } from "../migrations/1725475949196-Upvote";

const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: Number(process.env.PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Post, User, Upvote],
    migrationsTableName: "lirredit_server_migrations",
    migrations: [PostPlaceholder1725110085440, Upvote1725475949196],
    synchronize: false,
    logging: !__prod__
});

export default AppDataSource;