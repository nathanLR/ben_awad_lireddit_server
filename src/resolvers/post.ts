import { MyContext } from "src/types";
import { Post } from "../entities";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver{
    @Query(() => [Post])
    async posts(@Ctx() {em}: MyContext): Promise<Post[]>{
        const posts: Post[] = await em.find(Post);
        return posts;
    }

    @Query(() => Post, {nullable: true})
    async post(
        @Arg("id", () => Int) id: number,
        @Ctx() {em}: MyContext
    ): Promise<Post | null>{
        const post: Post | null = await em.findOne(Post, {where: {id: id}});
        return post;
    }

    @Mutation(() => Post)
    async create(
        @Arg("title", () => String) title: string,
        @Ctx() {em}: MyContext
    ): Promise<Post> {
        const newPost = em.create(Post, {title: title});
        await em.save(newPost);
        return newPost;
    }

    @Mutation(() => Post, {nullable: true})
    async update(
        @Arg("id", () => Int) id: number,
        @Arg("title", () => String) title: string,
        @Ctx() {em}: MyContext
    ): Promise<Post | null> {
        const postToUpdate: Post | null = await em.findOne(Post, {where: {id: id}});
        if (!postToUpdate)
            return null;
        postToUpdate.title = title;
        return await em.save(postToUpdate);
    }

    @Mutation(() => Post, {nullable: true})
    async delete(
        @Arg("id", () => Int) id: number,
        @Ctx() {em}: MyContext
    ): Promise<Post | null> {
        const postToDelete = await em.findOne(Post, {where: {id: id}});
        if (postToDelete != null)
            return await em.remove(postToDelete);
        else
            return null;
    }
}