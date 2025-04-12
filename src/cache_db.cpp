#include <node_api.h>
#include <iostream>
#include <unordered_map>
#include <string>
#include <mutex>
#include <chrono>
#include <thread>
#include <fstream>
#include <atomic>
#include <functional>
#include <vector>
#include <algorithm>

class Cache {
public:
    struct CacheEntry {
        std::string value;
        std::chrono::time_point<std::chrono::system_clock> expiry_time;
        CacheEntry() : value(""), expiry_time(std::chrono::system_clock::now()) {}
        CacheEntry(std::string val, int ttl) : value(val) {
            expiry_time = std::chrono::system_clock::now() + std::chrono::seconds(ttl);
        }
        bool isExpired() const {
            return std::chrono::system_clock::now() > expiry_time;
        }
    };

    std::unordered_map<std::string, CacheEntry> cache_map;
    std::mutex mtx;
    std::atomic<size_t> memory_usage;
    size_t max_memory = 50 * 1024 * 1024;
    std::vector<std::thread> threads;

    Cache() : memory_usage(0) {}

    void setAsync(const std::string& key, const std::string& value, int ttl = 0) {
        threads.push_back(std::thread([this, key, value, ttl]() {
            std::lock_guard<std::mutex> lock(mtx);
            size_t size = key.size() + value.size();
            memory_usage += size;

            if (memory_usage > max_memory) {
                evict();
            }

            cache_map[key] = CacheEntry(value, ttl);
            persistData();
        }));
    }

    void runInParallel(std::function<void()> task) {
        threads.push_back(std::thread(task));
    }

    std::vector<std::string> rangeQueryByValueLength(size_t min_length) {
        std::lock_guard<std::mutex> lock(mtx);
        std::vector<std::string> result;
        for (const auto& [key, entry] : cache_map) {
            if (entry.value.size() >= min_length) {
                result.push_back(key);
            }
        }
        return result;
    }

    std::vector<std::string> queryByTTL(int ttl_threshold) {
        std::lock_guard<std::mutex> lock(mtx);
        std::vector<std::string> result;
        for (const auto& [key, entry] : cache_map) {
            int ttl = std::chrono::duration_cast<std::chrono::seconds>(entry.expiry_time - std::chrono::system_clock::now()).count();
            if (ttl >= ttl_threshold) {
                result.push_back(key);
            }
        }
        return result;
    }

    std::string get(const std::string& key) {
        std::lock_guard<std::mutex> lock(mtx);
        auto it = cache_map.find(key);
        if (it != cache_map.end()) {
            if (it->second.isExpired()) {
                cache_map.erase(it);
                return "Key has expired";
            }
            return it->second.value;
        }
        return "Key not found";
    }

    void del(const std::string& key) {
        std::lock_guard<std::mutex> lock(mtx);
        auto it = cache_map.find(key);
        if (it != cache_map.end()) {
            memory_usage -= (it->first.size() + it->second.value.size());
            cache_map.erase(it);
            persistData();
        }
    }

    bool exists(const std::string& key) {
        std::lock_guard<std::mutex> lock(mtx);
        auto it = cache_map.find(key);
        return it != cache_map.end() && !it->second.isExpired();
    }

    void evict() {
        if (cache_map.empty()) return;
        auto it = cache_map.begin();
        memory_usage -= (it->first.size() + it->second.value.size());
        cache_map.erase(it);
    }

    void persistData() {
        std::ofstream file("cache_persistence.txt", std::ios::app);
        if (file.is_open()) {
            for (const auto& [key, entry] : cache_map) {
                file << key << ":" << entry.value << "\n";
            }
        }
    }

    void loadFromFile() {
        std::ifstream file("cache_persistence.txt");
        std::string key, value;
        while (std::getline(file, key, ':') && std::getline(file, value)) {
            cache_map[key] = CacheEntry(value, 0);
        }
    }

    void waitForAllThreads() {
        for (auto& thread : threads) {
            if (thread.joinable()) {
                thread.join();
            }
        }
        threads.clear();
    }
};

Cache cache;

napi_value SetCache(napi_env env, napi_callback_info info) {
    size_t argc = 3;
    napi_value args[3];
    napi_status status = napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);
    if (status != napi_ok) return nullptr;

    char key[1024];
    size_t key_len;
    status = napi_get_value_string_utf8(env, args[0], key, sizeof(key), &key_len);
    if (status != napi_ok) return nullptr;

    char value[1024];
    size_t value_len;
    status = napi_get_value_string_utf8(env, args[1], value, sizeof(value), &value_len);
    if (status != napi_ok) return nullptr;

    int ttl;
    status = napi_get_value_int32(env, args[2], &ttl);
    if (status != napi_ok) return nullptr;

    cache.setAsync(key, value, ttl);

    napi_value result;
    status = napi_create_string_utf8(env, "Success", NAPI_AUTO_LENGTH, &result);
    if (status != napi_ok) return nullptr;

    return result;
}

napi_value GetCache(napi_env env, napi_callback_info info) {
    size_t argc = 1;
    napi_value args[1];
    napi_status status = napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);
    if (status != napi_ok) return nullptr;

    char key[1024];
    size_t key_len;
    status = napi_get_value_string_utf8(env, args[0], key, sizeof(key), &key_len);
    if (status != napi_ok) return nullptr;

    std::string result = cache.get(key);

    napi_value result_value;
    status = napi_create_string_utf8(env, result.c_str(), result.length(), &result_value);
    if (status != napi_ok) return nullptr;

    return result_value;
}

napi_value Init(napi_env env, napi_value exports) {
    napi_status status;

    napi_value set_method;
    status = napi_create_function(env, nullptr, 0, SetCache, nullptr, &set_method);
    if (status != napi_ok) return nullptr;
    status = napi_set_named_property(env, exports, "setCache", set_method);

    napi_value get_method;
    status = napi_create_function(env, nullptr, 0, GetCache, nullptr, &get_method);
    if (status != napi_ok) return nullptr;
    status = napi_set_named_property(env, exports, "getCache", get_method);

    return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
