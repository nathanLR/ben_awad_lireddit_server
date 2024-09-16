import DataLoader from "dataloader";
import { Upvote } from "../entities";
import { In } from "typeorm";
import AppDataSource from "../data-source";

export const createVoteStatusLoader = () => new DataLoader<{userId: number, postId: number}, number | null>(async (keys) => {
    const upvotes = await AppDataSource.manager.findBy(Upvote, {postId: In(keys.map(key => key.postId)), userId: In(keys.map(key => key.userId))});
    const idsToValue: Record<string, number | null> = {};
    upvotes.forEach(upvote => {
        idsToValue[`${upvote.postId}:${upvote.userId}`] = upvote.value;
    })
    console.log(upvotes);
    return keys.map(key => idsToValue[`${key.postId}:${key.userId}`]);
});