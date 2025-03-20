import React, { useState } from 'react';
import axios from 'axios';

const CacheAPIComponent = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [dbName, setDbName] = useState('');
    const [key, setKey] = useState('');
    const [value, setValue] = useState('');
    const [ttl, setTtl] = useState('');
    const [query, setQuery] = useState('');
    const [responseMessage, setResponseMessage] = useState('');
    const [cacheValue, setCacheValue] = useState('');

    const handleInitializeDb = async () => {
        try {
            const response = await axios.post('http://localhost:3000/initialize', {
                name,
                email,
                dbName
            });
            setResponseMessage(response.data.message);
        } catch (error) {
            setResponseMessage('Error initializing DB: ' + error.message);
        }
    };

    const handleSetCache = async () => {
        try {
            const response = await axios.post(`http://localhost:3000/${dbName}/set`, {
                key,
                value,
                ttl: parseInt(ttl),
                persistence: 'session' // You can change this based on your need
            });
            setResponseMessage(response.data.message);
        } catch (error) {
            setResponseMessage('Error setting cache: ' + error.message);
        }
    };

    const handleGetCache = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/${dbName}/get`, {
                params: { key, query }
            });
            if (response.data.message) {
                setCacheValue(response.data.message);
            } else {
                setCacheValue(response.data.value);
            }
        } catch (error) {
            setCacheValue('Error getting cache: ' + error.message);
        }
    };

    return (
        <div>
            <h1>Cache API Testing</h1>
            <div>
                <h2>Initialize Database</h2>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Database Name"
                    value={dbName}
                    onChange={(e) => setDbName(e.target.value)}
                />
                <button onClick={handleInitializeDb}>Initialize DB</button>
            </div>

            <div>
                <h2>Set Cache</h2>
                <input
                    type="text"
                    placeholder="Key"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Value"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="TTL (seconds)"
                    value={ttl}
                    onChange={(e) => setTtl(e.target.value)}
                />
                <button onClick={handleSetCache}>Set Cache</button>
            </div>

            <div>
                <h2>Get Cache</h2>
                <input
                    type="text"
                    placeholder="Key"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button onClick={handleGetCache}>Get Cache</button>
                <p>{cacheValue}</p>
            </div>

            {responseMessage && <div><h3>{responseMessage}</h3></div>}
        </div>
    );
};

export default CacheAPIComponent;
