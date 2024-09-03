import { Post, User } from "../entities";
import { Field, InputType, ObjectType } from "type-graphql";

@InputType()
export class PostInput {
    @Field()
    title: string;

    @Field()
    text: string;
}

@ObjectType()
export class FieldError{
    @Field(() => String)
    field: string;

    @Field(() => String)
    message: string;
}

@ObjectType()
export class UserResponse{
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[];

    @Field(() => User, {nullable: true})
    user?: User;
}

@ObjectType()
export class PostResponse{
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[];

    @Field(() => Post, {nullable: true})
    post?: Post
}

@ObjectType()
export class PaginatedPosts{
    @Field(() => [Post])
    posts: Post[];

    @Field(() => Boolean)
    hasMore: boolean;
}