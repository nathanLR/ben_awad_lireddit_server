import { AppDataSource, em } from "./data-source";
import { Post } from "./entities/Post";
import logger from "./utils/logger";
import "dotenv/config";
import express from "express"

AppDataSource.initialize().then(() => {
    logger.info(`Connection to database established on port ${process.env.DB_PORT}`);
    AppDataSource.runMigrations(); 
    // const myPost = em.create(Post, {title: "my first post"});
    // em.save(myPost);

    const app = express();
    app.listen(process.env.APP_PORT, () => {
        logger.info(`App is running: http://localhost:${process.env.APP_PORT}`);
    })
}).catch((error) => {
    logger.error(error.message);
})