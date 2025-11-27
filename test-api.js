// Using built-in fetch

async function testApi() {
    const API_URL = 'http://localhost:3000/api/warranties';

    console.log('Testing POST...');
    try {
        const postRes = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: 'test-123',
                productName: 'Node Test Product',
                purchaseDate: '2023-10-27',
                warrantyPeriod: '1 year'
            })
        });
        const postData = await postRes.json();
        console.log('POST Response:', postData);
    } catch (e) {
        console.error('POST Failed:', e);
    }

    console.log('Testing GET...');
    try {
        const getRes = await fetch(API_URL);
        const getData = await getRes.json();
        console.log('GET Response:', getData);
    } catch (e) {
        console.error('GET Failed:', e);
    }
}

testApi();
