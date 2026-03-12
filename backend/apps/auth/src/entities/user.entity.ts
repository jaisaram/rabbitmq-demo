import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    tenantId: string;

    @Column({ default: 'USER' })
    role: string;

    @Column({ default: false })
    isDefaultAdmin: boolean;

    @Column({ default: 0 })
    tokenVersion: number;
}
