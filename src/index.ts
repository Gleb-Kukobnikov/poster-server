import 'reflect-metadata';
import {MikroORM} from '@mikro-orm/core';
// import {__prod__} from "./constants";
// import {Post} from "./entities/Post";
import mikroOrmConfig from './mikro-orm.config';
// EXPRESS
import express from 'express';
import {ApolloServer} from 'apollo-server-express';
import {buildSchema} from 'type-graphql';
import {HelloResolver} from "./resolvers/hello";
import {PostResolver} from "./resolvers/post";
import {UserResolver} from "./resolvers/user";
// REDIS
import redis from "redis";
import session from "express-session";
import connectRedis from 'connect-redis';
import {__prod__} from "./constants";
import {EMContext} from "./types";

const main = async () => {

    const orm = await MikroORM.init({...mikroOrmConfig});

    await orm.getMigrator().up();

    // const post = orm.em.create(Post, { title: 'First post' });
    // orm.em.persistAndFlush(post);

    // const posts = await orm.em.find(Post, {  });
    // console.log(posts);

    const app = express();

    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient();

    app.use(
        session({
            name: 'poster',
            store: new RedisStore({ client: redisClient, disableTouch: true  }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365,
                httpOnly: true,
                sameSite: 'lax',
                secure: __prod__,
            },
            saveUninitialized: false,
            secret: 'poster-redis-secret ',
            resave: false,
        })
    );

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        context: ({ req, res }): EMContext => ({ em: orm.em, req, res  }),
    });

    await apolloServer.start();

    apolloServer.applyMiddleware({ app });

    app.listen(4000, () => {
        console.log('Served on localhost:4000');
    });
};

main();
