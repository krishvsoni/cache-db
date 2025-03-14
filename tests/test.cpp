#include <gtest/gtest.h>
#include "../src/cache_db.cpp"

TEST(CacheTest, SetAndGetTest) {
    Cache cache;
    cache.set("key1", "value1", 10);
    EXPECT_EQ(cache.get("key1"), "value1");
}

TEST(CacheTest, ExpiryTest) {
    Cache cache;
    cache.set("key1", "value1", 2);
    std::this_thread::sleep_for(std::chrono::seconds(3));
    EXPECT_EQ(cache.get("key1"), "Key has expired");
}

TEST(CacheTest, DeleteTest) {
    Cache cache;
    cache.set("key1", "value1", 10);
    cache.del("key1");
    EXPECT_EQ(cache.get("key1"), "Key not found");
}

TEST(CacheTest, ExistsTest) {
    Cache cache;
    cache.set("key1", "value1", 10);
    EXPECT_TRUE(cache.exists("key1"));
    cache.del("key1");
    EXPECT_FALSE(cache.exists("key1"));
}

int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
