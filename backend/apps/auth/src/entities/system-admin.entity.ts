import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('system_admins')
export class SystemAdmin {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ default: true })
    isSuper: boolean;
}
