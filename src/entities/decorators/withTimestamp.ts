import {Entity, Property} from "@mikro-orm/core";
import {Field, ObjectType} from "type-graphql";

export function withTimestamp<T extends { new (...args: any[]): {} }>(constructor: T) {
    @ObjectType()
    @Entity()
    class withTimestampClass extends constructor {
        @Field(() => String)
        @Property({ type: 'date' })
        createdAt = new Date();

        @Field(() => String)
        @Property({ type: 'date', onUpdate: () => new Date() })
        updatedAt = new Date();
    }

    return withTimestampClass;
}
