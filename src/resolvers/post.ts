import { MyContext } from "src/types";
import { Post, User } from "../entities";
import { Arg, Ctx, FieldResolver, Int, Mutation, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { FieldError, PaginatedPosts, PostInput, PostResponse } from "../utils/graphqlTypes";
import { isAuth } from "../middleware/isAuth";
import { createPostValidation } from "../utils/formValidation";
import { FindOptionsWhere, LessThan } from "typeorm";

@Resolver(Post)
export class PostResolver {
    @FieldResolver(() => String)
    textExcerpt(@Root() post: Post) {
        const words = post.text.split(' ', 25);
        return words.join(' ') + "...";
    }

    @FieldResolver(() => Int, { nullable: true })
    async voteStatus(
        @Root() post: Post,
        @Ctx() { req, voteStatusLoader }: MyContext
    ): Promise<number | null> {
        if (req.session.userId) {
            const upvoteValue = await voteStatusLoader.load({postId: post.id, userId: req.session.userId});
            if (!upvoteValue)
                return null;
            return upvoteValue;
        }
        return null;
    }

    @Query(() => PaginatedPosts)
    async getPosts(
        @Ctx() { em }: MyContext,
        @Arg("limit", () => Int) limit: number,
        @Arg("cursor", () => String, { nullable: true }) cursor: string,
    ): Promise<PaginatedPosts> {
        const realLimit = Math.min(50, limit);
        const realLimitPlusOne = realLimit + 1;
        const whereClause: FindOptionsWhere<Post> = {}

        if (cursor)
            whereClause.createdAt = LessThan(new Date(parseInt(cursor)));

        const posts = await em.find(Post, {
            order: { createdAt: "DESC" },
            take: realLimitPlusOne,
            where: whereClause,
            relations: { user: true }
        });
        const result = {
            hasMore: posts.length == realLimitPlusOne,
            posts: posts.slice(0, realLimit)
        };
        return result;
    }

    @Query(() => PaginatedPosts)
    async getUserPosts(
        @Ctx() { em }: MyContext,
        @Arg("limit", () => Int) limit: number,
        @Arg("cursor", () => String, { nullable: true }) cursor: string,
        @Arg("username", () => String) username: string
    ): Promise<PaginatedPosts> {
        const realLimit = Math.min(50, limit);
        const realLimitPlusOne = realLimit + 1;
        const user = await em.findOne(User, { where: { username: username } });
        if (!user)
            return { hasMore: false, posts: [] };

        const whereClause: FindOptionsWhere<Post> = {
            userId: user.id,
        }
        if (cursor)
            whereClause.createdAt = LessThan(new Date(parseInt(cursor)));

        const posts = await em.find(Post, {
            order: { createdAt: "DESC" },
            take: realLimitPlusOne,
            where: whereClause,
            relations: { user: true }
        });
        const result = {
            hasMore: posts.length == realLimitPlusOne,
            posts: posts.slice(0, realLimit)
        };
        return result;
    }

    @Query(() => Post, { nullable: true })
    async getPost(
        @Arg("id", () => Int) id: number,
        @Ctx() { em }: MyContext
    ): Promise<Post | null> {
        const post: Post | null = await em.findOne(Post, { where: { id: id }, relations: { user: true } });
        return post;
    }

    @Mutation(() => PostResponse)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg("input", () => PostInput) input: PostInput,
        @Ctx() { em, req }: MyContext
    ): Promise<PostResponse> {
        let errors: FieldError[] = createPostValidation(input);
        const user = await em.findOne(User, { where: { id: req.session.userId } });
        if (!user)
            errors.push({
                field: "user",
                message: "The specified user does not exist on the database."
            });
        if (errors.length > 0)
            return { errors }
        const newPost = em.create(Post, { title: input.title, text: input.text, user: user });
        await em.save(newPost);
        return { post: newPost };
    }

    @Mutation(() => PostResponse)
    @UseMiddleware(isAuth)
    async updatePost(
        @Arg("id", () => Int) id: number,
        @Arg("title", () => String) title: string,
        @Arg("text", () => String) text: string,
        @Ctx() { em }: MyContext
    ): Promise<PostResponse> {
        const postToUpdate: Post | null = await em.findOne(Post, { where: { id: id } });
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
        if (text.length == 0)
            return {
                errors: [{
                    field: "text",
                    message: "You need to provide a text to the post."
                }]
            }
        postToUpdate.title = title;
        postToUpdate.text = text;
        await em.save(postToUpdate)
        return {
            post: postToUpdate
        }
    }

    @Mutation(() => PostResponse)
    @UseMiddleware(isAuth)
    async deletePost(
        @Arg("id", () => Int) id: number,
        @Ctx() { em, req }: MyContext
    ): Promise<PostResponse> {
        const postToDelete = await em.findOne(Post, { where: { id: id } });
        if (!postToDelete)
            return {
                errors: [{
                    field: "id",
                    message: "This post does not exist on the database."
                }]
            }
        if (req.session.userId != postToDelete.userId)
            return {
                errors: [{
                    field: "id",
                    message: "You cannot delete a post that's not yours."
                }]
            }
        const deletedPost = { ...postToDelete };
        await em.remove(postToDelete);
        return {
            post: deletedPost
        };
    }
}