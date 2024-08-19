import { ApolloServer } from "@apollo/server";
import {expressMiddleware} from "@apollo/server/express4";
import AppDataSource from "./data-source";
import logger from "./utils/logger";
import "dotenv/config";
import express, { Request, Response } from "express"
import { buildSchema } from "type-graphql";
import cors from "cors";
import { PostResolver } from "./resolvers/post";
import { MyContext } from "./types";
import { UserResolver } from "./resolvers/user";
import RedisStore from "connect-redis"
import session from "express-session"
import {createClient} from "redis"
import { __prod__, COOKIE_NAME } from "./constants";
import { sendEmail } from "./utils/emailManager";

AppDataSource.initialize().then(async () => {
    //await sendEmail("nathan.leroux3@gmail.com", "test objet", "c'est le contenu du mail");
    logger.info(`Connection to database established on port ${process.env.DB_PORT}`);
    await AppDataSource.runMigrations(); 
    
    const app = express();
    const apolloServer = new ApolloServer<MyContext>({
        schema: await buildSchema({
            resolvers: [PostResolver, UserResolver]
        })
    });
    const redisClient = createClient();
    redisClient.connect().catch(console.error);
    const redisStore = new RedisStore({
        client: redisClient,
        prefix: "myapp:",
        disableTouch: true,
    });
    await apolloServer.start();
    app.use(
        session({
            name: COOKIE_NAME,
            store: redisStore,
            resave: false, // required: force lightweight session keep alive (touch)
            saveUninitialized: false, // recommended: only save session when data exists
            secret: process.env.REDIS_SECRET,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
                httpOnly: true,
                secure: __prod__,
                sameSite: "lax"
            }
        }),
    );
    app.use(
        "/graphql",
        cors<cors.CorsRequest>({origin: ["http://localhost:3000"], credentials: true}),
        express.json(),
        expressMiddleware(
            apolloServer,
            {
                context: async ({req, res}: {req: Request, res: Response}): Promise<MyContext> => ({em: AppDataSource.manager, req, res})
            }
        ));
    app.listen(process.env.APP_PORT, () => {
        logger.info(`App is running: http://localhost:${process.env.APP_PORT}`);
    })
}).catch((error) => {
    logger.error(error.message);
})