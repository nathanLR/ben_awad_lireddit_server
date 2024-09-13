import { Field, Int, ObjectType } from "type-graphql";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import User from "./User";
import Upvote from "./Upvote";

@ObjectType()
@Entity("post")
export default class Post{
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
    @Column()
    title!: string;

    @Field(() => String)
    @Column()
    text!: string;

    @Field(() => Int)
    @Column({type: "int", default: 0})
    points!: number
    
    @Column()
    userId!: number;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.posts)
    user!: User;

    //@Field(() => [Upvote], {nullable: true})
    @OneToMany(() => Upvote, (upvote) => upvote.post, {onDelete: "CASCADE"})
    upvotes: Upvote[];
}