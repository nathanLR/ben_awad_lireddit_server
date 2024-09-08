import logger from "../utils/logger";
import AppDataSource from "../data-source";
import { Post, Upvote } from "../entities";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import { Arg, Ctx, Int, Mutation, Resolver, UseMiddleware } from "type-graphql";


@Resolver(Upvote)
export default class UpvoteResolver {

    @Mutation(() => Upvote, {nullable: true})
    @UseMiddleware(isAuth)
    async vote(
        @Arg("value", () => Int) value: number,
        @Arg("postId", () => Int) postId: number,
        @Ctx() {req, em}: MyContext
    ): Promise<Upvote | null>{
        /*
        Multiple cases:
        user's first vote on post => create new upvote and update post points by -1 or 1.
        user change his vote => update upvote and update post points by (-1 or 1) * 2
        user remove hos vote => delete upvote from db and update post points by upvote value
        */
        const upvote: Upvote | null = await em.findOne(Upvote, {where: {postId: postId, userId: req.session.userId}});
        const post: Post | null = await em.findOne(Post, {where: {id: postId}});
        if (!post) return null;
        if (!upvote){
            // CASE: first interaction with post;
            const newUpvote = em.create(Upvote, {value: value, postId: postId, userId: req.session.userId});
            await AppDataSource.transaction(async (TEM) => {
                await TEM.save(newUpvote);
                post.points += value;
                await TEM.save(post);
            }).catch(error => {
                logger.error(error.message);
                return null;
            })
            return {...newUpvote, status: "new"};
        } else if (value != upvote.value){
            // CASE: changing post vote;
            upvote.value = value;
            post.points += (value * 2);
            await em.save([upvote, post]).catch(error => {
                logger.error(error.message);
                return null;
            });
            return {...upvote, value: value * 2, status: "changed"};
        } else {
            // CASE: removing vote;
            const result: Upvote = {
                value: -value,
                postId: post.id,
                status: "removed",
                userId: req.session.userId!
            }
            post.points -= upvote.value;
            await em.remove(upvote);
            await em.save(post);
            return result;
        }
    }
}