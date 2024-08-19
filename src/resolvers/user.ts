import argon2 from "argon2";
import { User } from "../entities";
import { MyContext } from "src/types";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { UserResponse } from "../utils/graphqlTypes";
import logger from "../utils/logger";
import { COOKIE_NAME } from "../constants";
import { emailIsValid } from "../utils/helpers";

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
        @Arg("email", () => String) email: string,
        @Ctx() {em, req}: MyContext
    ): Promise<UserResponse>{
        if (username.length == 0)
            return {
                errors: [{
                    field: "username",
                    message: "You need to provide a username in order to create an account."
                }]
            }
        if (email.length == 0 || (email.length > 0 && !emailIsValid(email)))
            return {
                errors: [{
                    field: "email",
                    message: "You need to provide a valid email in order to create an account."
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
        if (await em.findOne(User, {where: {email: email}}) != null)
            return {
                errors: [{
                    field: "email",
                    message: "This email address is already taken."
                }]
            }
        const hash = await argon2.hash(password);
        const newUser = em.create(User, {username: username, email: email, password: hash});
        await em.save(newUser);
        req.session.userId = newUser.id;
        return {user: newUser};
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg("usernameOrEmail", () => String) usernameOrEmail: string,
        @Arg("password", () => String) password: string,
        @Ctx() {em, req}: MyContext
    ): Promise<UserResponse>{
        const user = await em.findOne(User, {where: 
            usernameOrEmail.includes("@") ? {email: usernameOrEmail} : {username: usernameOrEmail}
        });
        if (!user)
            return {
                errors: [{
                    field: "usernameOrEmail",
                    message: `Couldn't find any User with the provided ${usernameOrEmail.includes("@") ? "email" : "username"}.`
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

    @Mutation(() => Boolean)
    logout(
        @Ctx() {req, res}: MyContext
    ): Promise<boolean>{
        const logoutPromise = new Promise<boolean>((resolve) => {
            req.session.destroy(error => {
                if (error){
                    logger.error(error.message);
                    resolve(false);
                }else{
                    res.clearCookie(COOKIE_NAME);
                    resolve(true);
                }
            })
        });
        return logoutPromise;
    }

    @Query(() => [User])
    async getUsers(
        @Ctx() {em}: MyContext
    ): Promise<User[]>{
        const users: User[] = await em.find(User);
        return users;
    }
}