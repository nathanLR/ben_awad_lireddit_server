import argon2 from "argon2";
import { User } from "../entities";
import { MyContext } from "src/types";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { FieldError, UserResponse } from "../utils/graphqlTypes";
import logger from "../utils/logger";
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from "../constants";
import { registerValidation } from "../utils/formValidation";
import { sendEmail } from "../utils/emailManager";
import { v4 as uuidV4 } from "uuid";

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
        let errors: FieldError[] = registerValidation(username, password, email)
        // if (await em.findOne(User, {where: {username: username}}) != null)
        //     return {
        //         errors: [{
        //             field: "username",
        //             message: "This username is already taken."
        //         }]
        //     }
        // if (await em.findOne(User, {where: {email: email}}) != null)
        //     return {
        //         errors: [{
        //             field: "email",
        //             message: "This email address is already taken."
        //         }]
        //     }
        if (await em.findOne(User, {where: {username: username}}) != null)
                errors.push({
                    field: "username",
                    message: "This username is already taken."
                })
        if (await em.findOne(User, {where: {email: email}}) != null)
                errors.push({
                    field: "email",
                    message: "This email address is already taken."
                })
        
        if (errors.length > 0)
            return {errors}

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

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg("email") email: string,
        @Ctx() {em, redis}: MyContext
    ): Promise<boolean>{
        const user = await em.findOne(User, {where: {email: email}});
        if (!user)
            return true;
        const token: string = uuidV4();

        const result:string = await redis.set(FORGOT_PASSWORD_PREFIX + token, user.id, "EX", 1000 * 60 * 60 * 2); // 2 hours
        if (result == "OK"){
            await sendEmail(email, "Reset password", `<a href="http://localhost:3000/reset-password/${token}">Click here to reset your password</>`);
            return true;
        }else
            return false;
    }

    @Mutation(() => UserResponse)
    async resetPassword(
        @Arg("password") password: string,
        @Arg("confirmPassword") confirmPassword: string,
        @Arg("token") token: string,
        @Ctx() {em, redis}: MyContext
    ): Promise<UserResponse>{
        console.log("coucou");
        if (password != confirmPassword)
            return {errors: [{
                field: "confirmPassword",
                message: "Passwords do not match."
            }]}
        const userId = await redis.get(FORGOT_PASSWORD_PREFIX + token);
        if (!userId)
            return { 
                errors: [{
                    field: "confirmPassword",
                    message: "Your reset password token has expired."
                }]
            }
        
        const user = await em.findOne(User, {where: {id: parseInt(userId)}});
        if (!user)
            return {
                errors: [{
                    field: "confirmPassword",
                    message: "Your account was not found on the database"
                }]
            }
        user.password = await argon2.hash(password);
        await em.save(user);
        await redis.del([FORGOT_PASSWORD_PREFIX + token]);
        return {
            user: user
        };
    }

    @Query(() => [User])
    async getUsers(
        @Ctx() {em}: MyContext
    ): Promise<User[]>{
        const users: User[] = await em.find(User);
        return users;
    }
}