import { ApolloServer } from "@apollo/server";
import {expressMiddleware} from "@apollo/server/express4";
import AppDataSource from "./data-source";
import logger from "./utils/logger";
import "dotenv/config";
import express from "express"
import { buildSchema } from "type-graphql";
import cors from "cors";
import { PostResolver } from "./resolvers/post";
import { MyContext } from "./types";

AppDataSource.initialize().then(async () => {
    logger.info(`Connection to database established on port ${process.env.DB_PORT}`);
    await AppDataSource.runMigrations(); 
    
    const app = express();
    const apolloServer = new ApolloServer<MyContext>({
        schema: await buildSchema({
            resolvers: [PostResolver]
        })
    });
    await apolloServer.start();
    app.use("/graphql", cors<cors.CorsRequest>(), express.json(), expressMiddleware(apolloServer, { context: async ({req}) => ({token: req.headers.token, em: AppDataSource.manager})}));
    app.listen(process.env.APP_PORT, () => {
        logger.info(`App is running: http://localhost:${process.env.APP_PORT}`);
    })
}).catch((error) => {
    logger.error(error.message);
})