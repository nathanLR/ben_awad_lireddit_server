import "reflect-metadata";
import { DataSource } from "typeorm";
import "dotenv/config";
import { __prod__ } from "./constants";
import { Post, Upvote, User } from "./entities";
import { GitChanges1725976861048 } from "../migrations/1725976861048-GitChanges";
import { PostDatas1725977259043 } from "../migrations/1725977259043-PostDatas";
import { PostChange1726151464140 } from "../migrations/1726151464140-PostChange";

const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: Number(process.env.PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Post, User, Upvote],
    migrationsTableName: "lirredit_server_migrations",
    migrations: [GitChanges1725976861048, PostDatas1725977259043, PostChange1726151464140],
    synchronize: false,
    logging: !__prod__
});

export default AppDataSource;