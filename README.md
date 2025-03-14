### cache-DB Endpoints Usage

#### 1. Set Cache Data (GET Request)
- **URL:**  
    `GET http://localhost:3000/userdb1/set?key=myKey&value=myValue&ttl=10`

---

#### 2. Get Cache Data (GET Request)
- **URL:**  
    `GET http://localhost:3000/userdb1/get?key=myKey`

---

### Set Cache Data (POST Request)

#### **Endpoint Details**
- **URL:**  
    `http://localhost:3000/{db_name}/set`
- **Method:**  
    `POST`

#### **Request Body**
```json
{
        "key": "myKey",
        "value": "myValue",
        "ttl": 10
}
```

#### **Example Request**
- **URL:**  
    `http://localhost:3000/userdb1/set`
- **Method:**  
    `POST`
- **Body:**  
    ```json
    {
            "key": "myKey",
            "value": "myValue",
            "ttl": 10
    }
    ```

#### **Expected Responses**

**Success Response:**
```json
{
        "message": "Cache set successfully!"
}
```

**Failure Response (Missing Parameters):**
```json
{
        "message": "Missing required parameters: key, value, ttl"
}
```

---

### Get Cache Data (GET Request)

#### **Endpoint Details**
- **URL:**  
    `http://localhost:3000/{db_name}/get`
- **Method:**  
    `GET`

#### **URL Parameters**
- **key:** The cache key you want to retrieve.

#### **Example Request**
- **URL:**  
    `http://localhost:3000/userdb1/get?key=myKey`
- **Method:**  
    `GET`

#### **Expected Responses**

**Success Response:**
```json
{
        "key": "myKey",
        "value": "myValue"
}
```

**Failure Response (Missing Key):**
```json
{
        "message": "Key is required"
}
```

**Failure Response (Cache Expired or Not Found):**
```json
{
        "key": "myKey",
        "value": null
}
```