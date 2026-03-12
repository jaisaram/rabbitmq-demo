import axios from 'axios';

async function verifyProfile() {
    const gatewayUrl = 'http://localhost:5001';

    // 1. Login to get token
    console.log('--- Logging in as tenant@jaisa.com ---');
    try {
        const loginRes = await axios.post(`${gatewayUrl}/auth/tenant/login`, {
            slug: 'jaisa',
            email: 'tenant@jaisa.com',
            password: 'tenant123'
        });

        const token = loginRes.data.accessToken;
        const userId = '5786c31a-adb8-4c96-81ec-45c1ac3b75d9';
        const slug = 'jaisa';

        console.log('Login successful. Token acquired.');

        // 2. Fetch Profile via dynamic slug route
        console.log(`--- Fetching Profile via /${slug}/user/${userId} ---`);
        const profileRes = await axios.get(`${gatewayUrl}/${slug}/user/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Profile Data:', profileRes.data);

        // 3. Update Profile
        console.log('--- Updating Profile ---');
        const updateRes = await axios.post(`${gatewayUrl}/${slug}/profile`, {
            userId: userId,
            firstName: 'Jaisa',
            lastName: 'Admin',
            avatarUrl: 'https://gravatar.com/avatar/jaisa'
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Update Result:', updateRes.data);

        // 4. Verify Update
        console.log('--- Verifying Update ---');
        const verifyRes = await axios.get(`${gatewayUrl}/${slug}/user/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Updated Profile Data:', verifyRes.data);

        if (verifyRes.data.firstName === 'Jaisa' && verifyRes.data.lastName === 'Admin') {
            console.log('✅ PROFILE UPDATE VERIFIED SUCCESSFULLY');
        } else {
            console.log('❌ PROFILE UPDATE FAILED');
        }

    } catch (error: any) {
        console.error('Test Failed:', error.response?.data || error.message);
    }
}

verifyProfile();
