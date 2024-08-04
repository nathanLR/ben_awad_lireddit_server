import { User } from "../entities";
import { Field, ObjectType } from "type-graphql";

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