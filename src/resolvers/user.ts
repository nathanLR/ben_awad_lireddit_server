import argon2 from "argon2";
import { User } from "../entities";
import { MyContext } from "src/types";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { UserResponse } from "../utils/graphqlTypes";

@Resolver()
export class UserResolver {

    @Query(() => User, {nullable: true})
    async whoAmI(
        @Ctx() {em, req}: MyContext
    ): Promise<User | null>{
        if (!req.session.userId)
            return null;
        const user: User | null = await em.findOne(User, {where: {id: req.session.userId}});
        return user;
    }

    @Mutation(() => UserResponse)
    async createUser(
        @Arg("username", () => String) username: string,
        @Arg("password", () => String) password: string,
        @Ctx() {em, req}: MyContext
    ): Promise<UserResponse>{
        
        if (username.length == 0)
            return {
                errors: [{
                    field: "username",
                    message: "You need to provide a username in order to create an account."
                }]
            }
        if (password.length < 6)
            return {
                errors: [{
                    field: "password",
                    message: "Password must be at least 6 characters long."
                }]
            }
        if (await em.findOne(User, {where: {username: username}}) != null)
            return {
                errors: [{
                    field: "username",
                    message: "This username is already taken."
                }]
            }
        const hash = await argon2.hash(password);
        const newUser = em.create(User, {username: username, password: hash});
        await em.save(newUser);
        req.session.userId = newUser.id;
        return {user: newUser};
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg("username", () => String) username: string,
        @Arg("password", () => String) password: string,
        @Ctx() {em, req}: MyContext
    ): Promise<UserResponse>{
        const user = await em.findOne(User, {where: {username: username}});
        if (!user)
            return {
                errors: [{
                    field: "username",
                    message: `Couldn't find any User with the name ${username}.`
                }]
            }
        try {
            if(await argon2.verify(user.password, password)){
                req.session.userId = user.id;
                return {user: user};
            }
            else
                return {
                    errors: [{
                        field: "password",
                        message: "The password is incorrect."
                    }]
                }
        } catch (error: any) {
            return {
                errors: [{
                    field: "unkown",
                    message: error.message
                }]
             }
        } 
    }

    @Query(() => [User])
    async getUsers(
        @Ctx() {em}: MyContext
    ): Promise<User[]>{
        const users: User[] = await em.find(User);
        return users;
    }
}