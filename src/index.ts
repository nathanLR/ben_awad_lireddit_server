import { ApolloServer } from "@apollo/server";
import {expressMiddleware} from "@apollo/server/express4";
import { AppDataSource, em } from "./data-source";
import { Post } from "./entities/Post";
import logger from "./utils/logger";
import "dotenv/config";
import express from "express"
import { buildSchema } from "type-graphql";
import { TestResolver } from "./resolvers/test";
import cors from "cors";

AppDataSource.initialize().then(async () => {
    logger.info(`Connection to database established on port ${process.env.DB_PORT}`);
    await AppDataSource.runMigrations(); 
    // const myPost = em.create(Post, {title: "my first post"});
    // em.save(myPost);
    
    const app = express();
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [TestResolver]
        }),
    });
    await apolloServer.start();
    app.use("/graphql", cors<cors.CorsRequest>(), express.json(), expressMiddleware(apolloServer, { context: async ({req}) => ({token: req.header.token})}));
    app.listen(process.env.APP_PORT, () => {
        logger.info(`App is running: http://localhost:${process.env.APP_PORT}`);
    })
}).catch((error) => {
    logger.error(error.message);
})