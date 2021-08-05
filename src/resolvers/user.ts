import argon2 from 'argon2';
import {Arg, Ctx, Mutation, Resolver} from 'type-graphql';
import {UsernamePasswordInput, UserResponse} from "./resolverTypes";
import {EMContext} from "../types";
import {User} from "../entities";
import {POSTGRES_ERRORS} from "../constants";

@Resolver()
export class UserResolver {

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') { username, password }: UsernamePasswordInput,
        @Ctx() { em }: EMContext
    ): Promise<UserResponse> {
        if (username.length <= 2) {
            return {
                errors: [{
                    field: 'username',
                    message: 'Too short username (Length must be greater than 2)'
                }],
            };
        }

        if (password.length <= 2) {
            return {
                errors: [{
                    field: 'password',
                    message: 'Password length must be greater than 2',
                }],
            };
        }

        const hashedPassword = await argon2.hash(password);
        const user = em.create(User, { username, password: hashedPassword });

        try {
            await em.persistAndFlush(user);
        } catch (err) {
            if (err.code === POSTGRES_ERRORS.DUPLICATE_KEY_VAL) {
                return {
                    errors: [{
                        field: 'username',
                        message: 'That username already exists',
                    }],
                };
            }
        }

        return { user };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('options') { username, password }: UsernamePasswordInput,
        @Ctx() { em }: EMContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User, { username });

        if (!user) {
            return {
                errors: [{
                    field: 'username',
                    message: 'Incorrect username'
                }],
            };
        }

        const validPassword = await argon2.verify(user.password, password);

        if (!validPassword) {
            return {
                errors: [{
                    field: 'password',
                    message: 'Wrong password'
                }],
            };
        }

        return { user };
    }
}
