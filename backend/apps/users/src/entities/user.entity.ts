import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('user_profiles')
export class User {
    @PrimaryColumn('uuid')
    id: string;

    @Column({ nullable: true })
    email: string;

    @Column()
    tenantId: string;

    @Column({ nullable: true })
    firstName: string;

    @Column({ nullable: true })
    lastName: string;

    @Column({ nullable: true })
    avatarUrl: string;

    @Column({ type: 'jsonb', default: {} })
    metadata: any;
}
