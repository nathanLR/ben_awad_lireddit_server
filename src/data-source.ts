import "reflect-metadata";
import { DataSource } from "typeorm";
import "dotenv/config";
import { __prod__ } from "./constants";
import { Post, User } from "./entities";
import { Tables1723747577672 } from "../migrations/1723747577672-tables";

const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: Number(process.env.PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Post, User],
    migrationsTableName: "lirredit_server_migrations",
    migrations: [Tables1723747577672],
    synchronize: false,
    logging: !__prod__
});

export default AppDataSource;