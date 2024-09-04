import { MyContext } from "src/types";
import { Post, User } from "../entities";
import { Arg, Ctx, FieldResolver, Int, Mutation, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { FieldError, PaginatedPosts, PostInput, PostResponse } from "../utils/graphqlTypes";
import { isAuth } from "../middleware/isAuth";
import { createPostValidation } from "../utils/formValidation";
import { LessThan } from "typeorm";

@Resolver(Post)
export class PostResolver{
    @FieldResolver(() => String)
    textExcerpt(@Root() post: Post){
        const words = post.text.split(' ', 15);
        return words.join(' ') + "...";
    }


    @Query(() => PaginatedPosts)
    async getPosts(
        @Ctx() {em}: MyContext,
        @Arg("limit", () => Int) limit: number,
        @Arg("cursor", () => String, {nullable: true}) cursor: string
    ): Promise<PaginatedPosts>{
        const realLimit = Math.min(50, limit);
        const realLimitPlusOne = realLimit + 1;
        const posts = await em.find(Post, {
            order: {createdAt: "DESC"},
            take: realLimitPlusOne,
            where: cursor ? {createdAt: LessThan(new Date(parseInt(cursor)))} : undefined,
            relations: {user: true, upvotes: true}
        });
        return {
            hasMore: posts.length == realLimitPlusOne,
            posts: posts.slice(0, realLimit)
        }
    }

    @Query(() => Post, {nullable: true})
    async getPost(
        @Arg("id", () => Int) id: number,
        @Ctx() {em}: MyContext
    ): Promise<Post | null>{
        const post: Post | null = await em.findOne(Post, {where: {id: id}});
        return post;
    }

    @Mutation(() => PostResponse)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg("input", () => PostInput) input: PostInput,
        @Ctx() {em, req}: MyContext
    ): Promise<PostResponse> {
        let errors: FieldError[] = createPostValidation(input);
        const user = await em.findOne(User, {where: {id: req.session.userId}});
        if (!user)
            errors.push({
                field: "user",
                message: "The specified user does not exist on the database."
            });
        if (errors.length > 0)
            return {errors}
        const newPost = em.create(Post, {title: input.title, text: input.text, user: user});
        await em.save(newPost); 
        return { post: newPost};
    }

    @Mutation(() => PostResponse)
    async updatePost(
        @Arg("id", () => Int) id: number,
        @Arg("title", () => String) title: string,
        @Ctx() {em}: MyContext
    ): Promise<PostResponse> {
        const postToUpdate: Post | null = await em.findOne(Post, {where: {id: id}});
        if (!postToUpdate)
            return {
                errors: [{
                    field: "id",
                    message: "This post does not exist on the database."
                }]
            }
        if (title.length == 0)
            return {
                errors: [{
                    field: "title",
                    message: "You need to provide a title to the post."
                }]
            }
        postToUpdate.title = title;
        await em.save(postToUpdate)
        return {
            post: postToUpdate
        }
    }

    @Mutation(() => PostResponse)
    async deletePost(
        @Arg("id", () => Int) id: number,
        @Ctx() {em}: MyContext
    ): Promise<PostResponse> {
        const postToDelete = await em.findOne(Post, {where: {id: id}});
        if(!postToDelete)
            return {
                errors: [{
                    field: "id",
                    message: "This post does not exist on the database."
                }]
            }
        await em.remove(postToDelete);
        return {
            post: postToDelete
        };
    }
}