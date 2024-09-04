import { Field, Int, ObjectType } from "type-graphql";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import Post from "./Post";
import Upvote from "./Upvote";

@ObjectType()
@Entity("user")
export default class User {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;

    @Field(() => String)
    @Column({type: "varchar", length: 50, unique: true})
    email!: string;

    @Field(() => String)
    @Column({type: "varchar", length: 50, unique: true})
    username!: string;

    @Column()
    password!: string;

    @Field(() => [Post], {nullable: true})
    @OneToMany(() => Post, (post) => post.user)
    posts: Post[]

    @Field(() => [Upvote], {nullable: true})
    @OneToMany(() => Upvote, (upvote) => upvote.user)
    upvotes: Upvote[];
}