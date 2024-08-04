import "reflect-metadata";
import { DataSource } from "typeorm";
import "dotenv/config";
import { __prod__ } from "./constants";
import { PostMigration1722704129595 } from "../migrations/1722704129595-PostMigration";
import { UserMigration1722775460875 } from "../migrations/1722775460875-UserMigration";
import { Post, User } from "./entities";

const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: Number(process.env.PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Post, User],
    migrationsTableName: "lirredit_server_migrations",
    migrations: [PostMigration1722704129595, UserMigration1722775460875], 
    synchronize: false,
    logging: !__prod__
});

export default AppDataSource;