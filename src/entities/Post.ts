import { Field, Int, ObjectType } from "type-graphql";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import User from "./User";

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
    
    @Field(() => User)
    @ManyToOne(() => User, (user) => user.posts)
    user!: User;
}