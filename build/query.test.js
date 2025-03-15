const axios = require('axios');

const baseURL = 'http://localhost:3000';
const dbName = 'workflow';
const requestCount = 1000;
const delay = 100;

let successfulRequests = 0;
let failedRequests = 0;
let totalRequests = 0;
let startTime;

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function generateRandomTaskData() {
    return {
        key: `task_${generateUUID()}`,
        value: JSON.stringify({
            task_id: generateUUID(),
            title: `Task ${Math.floor(Math.random() * 1000)}`,
            status: 'pending',
            assigned_to: `User ${Math.floor(Math.random() * 100)}`,
            due_date: new Date(Date.now() + Math.floor(Math.random() * 10000000000)).toISOString(),
            comments: [{
                user: `User ${Math.floor(Math.random() * 100)}`,
                comment: `Comment number ${Math.floor(Math.random() * 1000)}`,
            }],
        }),
        ttl: 3600,
    };
}

async function setCacheData(taskData) {
    try {
        const response = await axios.post(`${baseURL}/${dbName}/set`, taskData, {
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.status === 200) {
            successfulRequests++;
        } else {
            failedRequests++;
        }
    } catch (error) {
        failedRequests++;
    }
}

async function getCacheData(taskKey) {
    try {
        const response = await axios.get(`${baseURL}/${dbName}/get`, {
            params: { key: taskKey }
        });
        if (response.status === 200) {
            successfulRequests++;
        } else {
            failedRequests++;
        }
    } catch (error) {
        failedRequests++;
    }
}

async function testLoad() {
    startTime = Date.now();
    console.log(`Starting performance test: Sending ${requestCount} requests...`);

    for (let i = 0; i < requestCount; i++) {
        totalRequests++;
        const taskData = generateRandomTaskData();

        if (Math.random() > 0.5) {
            await setCacheData(taskData);
        } else {
            await getCacheData(taskData.key);
        }

        if (i % 100 === 0) {
            console.log(`Progress: ${i} requests sent.`);
        }

        await new Promise(resolve => setTimeout(resolve, delay));
    }

    const endTime = Date.now();
    const elapsedTime = (endTime - startTime) / 1000;

    console.log(`Test complete!`);
    console.log(`Total requests sent: ${totalRequests}`);
    console.log(`Successful requests: ${successfulRequests}`);
    console.log(`Failed requests: ${failedRequests}`);
    console.log(`Time taken: ${elapsedTime.toFixed(2)} seconds`);
    console.log(`Requests per second: ${(totalRequests / elapsedTime).toFixed(2)} RPS`);
}

testLoad();
