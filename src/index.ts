import 'reflect-metadata';
import {MikroORM} from '@mikro-orm/core';
import {__prod__} from "./constants";
// import {Post} from "./entities/Post";
import mikroOrmConfig from './mikro-orm.config';
// EXPRESS
import express from 'express';
import {ApolloServer} from 'apollo-server-express';
import {buildSchema} from 'type-graphql';
import {HelloResolver} from "./resolvers/hello";
import {PostResolver} from "./resolvers/post";

const main = async () => {

    const orm = await MikroORM.init({...mikroOrmConfig});

    await orm.getMigrator().up();

    // const post = orm.em.create(Post, { title: 'First post' });
    // orm.em.persistAndFlush(post);

    // const posts = await orm.em.find(Post, {  });
    // console.log(posts);

    const app = express();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver],
            validate: false,
        }),
        context: () => ({ em: orm.em })
    });

    await apolloServer.start();

    apolloServer.applyMiddleware({ app });

    app.listen(4000, () => {
        console.log('Served on localhost:4000');
    });
};

main();
