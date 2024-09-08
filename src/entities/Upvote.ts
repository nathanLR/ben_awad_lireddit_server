import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import User from "./User";
import Post from "./Post";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export default class Upvote {
  @Field()
  @Column({ type: "int" })
  value!: number;

  @Field()
  @PrimaryColumn({ type: "int" })
  userId!: number;

  @Field()
  @PrimaryColumn({ type: "int" })
  postId!: number;

  @Field(() => String)
  status!: "new" | "removed" | "changed";

  @ManyToOne(() => User, (user) => user.upvotes)
  user?: User;

  @ManyToOne(() => Post, (post) => post.upvotes)
  post?: Post;
}
