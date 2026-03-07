import fetch from 'node-fetch';

async function main() {
    const loginRes = await fetch('http://localhost:8080/api/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneOrEmail: 'seeder', password: 'Password123!' })
    });

    // This might block, so let's just create a new specific account to ensure the user knows it
    console.log("Creating specific seeded account so we can tell the user exactly what it is...");
}

main();
