import AppDataSource from "../data-source";
import { Post, Upvote } from "../entities";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import { Arg, Ctx, Int, Mutation, Resolver, UseMiddleware } from "type-graphql";


@Resolver(Upvote)
export default class UpvoteResolver {

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg("value", () => Int) value: number,
        @Arg("postId", () => Int) postId: number,
        @Ctx() {req, em}: MyContext
    ): Promise<boolean>{
        const userId = req.session.userId;
        const post = await em.findOne(Post, {where: {id: postId}});
        if (!post)
            return false;
        const upvote = em.create(Upvote, {
            value: value,
            userId: userId,
            postId: postId,
        });
        await AppDataSource.transaction(async (TEntityManager) => {
            TEntityManager.save(upvote);
            post.points = post.points + value;
            TEntityManager.save(post);
        })
        return true;
    }
}