import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';

const PROTO_PATH = join(__dirname, '../../../protos/auth.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const authProto = grpc.loadPackageDefinition(packageDefinition).auth as any;

function main() {
    const client = new authProto.AuthService(
        'localhost:50051',
        grpc.credentials.createInsecure()
    );

    client.SystemAdminLogin({ email: 'admin@admin.com', password: 'admin123' }, (err, response) => {
        if (err) {
            console.error('Error:', err);
        } else {
            console.log('Response:', response);
        }
    });
}

main();
