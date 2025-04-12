"use client"

import { useState } from "react"
import axios from "axios"

const CacheAPIComponent = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [dbName, setDbName] = useState("")
  const [key, setKey] = useState("")
  const [value, setValue] = useState("")
  const [ttl, setTtl] = useState("")
  const [query, setQuery] = useState("")

  const [responseMessage, setResponseMessage] = useState("")
  const [cacheValue, setCacheValue] = useState("")
  const [isLoading, setIsLoading] = useState({
    initialize: false,
    set: false,
    get: false,
  })
  const [activeTab, setActiveTab] = useState("initialize")

  const handleInitializeDb = async (e) => {
    e.preventDefault()
    if (!name || !email || !dbName) {
      setResponseMessage("Please fill all required fields")
      return
    }

    setIsLoading((prev) => ({ ...prev, initialize: true }))
    try {
      const response = await axios.post("http://localhost:3000/initialize", {
        name,
        email,
        dbName,
      })
      setResponseMessage(response.data.message)
    } catch (error) {
      setResponseMessage("Error initializing DB: " + error.message)
    } finally {
      setIsLoading((prev) => ({ ...prev, initialize: false }))
    }
  }

  const handleSetCache = async (e) => {
    e.preventDefault()
    if (!dbName || !key || !value) {
      setResponseMessage("Please fill all required fields")
      return
    }

    setIsLoading((prev) => ({ ...prev, set: true }))
    try {
      const response = await axios.post(`http://localhost:3000/${dbName}/set`, {
        key,
        value,
        ttl: ttl ? Number.parseInt(ttl) : undefined,
        persistence: "session",
      })
      setResponseMessage(response.data.message)
    } catch (error) {
      setResponseMessage("Error setting cache: " + error.message)
    } finally {
      setIsLoading((prev) => ({ ...prev, set: false }))
    }
  }

  const handleGetCache = async (e) => {
    e.preventDefault()
    if (!dbName || !key) {
      setCacheValue("Please provide database name and key")
      return
    }

    setIsLoading((prev) => ({ ...prev, get: true }))
    try {
      const response = await axios.get(`http://localhost:3000/${dbName}/get`, {
        params: { key, query },
      })
      if (response.data.message) {
        setCacheValue(response.data.message)
      } else {
        setCacheValue(
          typeof response.data.value === "object"
            ? JSON.stringify(response.data.value, null, 2)
            : String(response.data.value),
        )
      }
    } catch (error) {
      setCacheValue("Error getting cache: " + error.message)
    } finally {
      setIsLoading((prev) => ({ ...prev, get: false }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-center text-cyan-400 mb-8 tracking-wider">cache-DB testing</h1>

          <div className="flex border-b border-gray-700 mb-6">
            <button
              onClick={() => setActiveTab("initialize")}
              className={`px-4 py-2 font-medium text-sm focus:outline-none transition-all duration-300 ${
                activeTab === "initialize"
                  ? "text-cyan-400 border-b-2 border-cyan-400 shadow-[0_4px_8px_rgba(34,211,238,0.25)]"
                  : "text-gray-400 hover:text-cyan-300"
              }`}
            >
              Initialize Database
            </button>
            <button
              onClick={() => setActiveTab("set")}
              className={`px-4 py-2 font-medium text-sm focus:outline-none transition-all duration-300 ${
                activeTab === "set"
                  ? "text-cyan-400 border-b-2 border-cyan-400 shadow-[0_4px_8px_rgba(34,211,238,0.25)]"
                  : "text-gray-400 hover:text-cyan-300"
              }`}
            >
              Set Cache
            </button>
            <button
              onClick={() => setActiveTab("get")}
              className={`px-4 py-2 font-medium text-sm focus:outline-none transition-all duration-300 ${
                activeTab === "get"
                  ? "text-cyan-400 border-b-2 border-cyan-400 shadow-[0_4px_8px_rgba(34,211,238,0.25)]"
                  : "text-gray-400 hover:text-cyan-300"
              }`}
            >
              Get Cache
            </button>
          </div>

          {responseMessage && (
            <div className="mb-6 p-4 rounded-md bg-gray-700 border border-cyan-800 text-cyan-300">
              <h3 className="font-medium text-cyan-400">Response:</h3>
              <p>{responseMessage}</p>
            </div>
          )}

          {activeTab === "initialize" && (
            <form onSubmit={handleInitializeDb} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                    Name <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-200 
                    focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-200 
                    focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="dbName" className="block text-sm font-medium text-gray-300 mb-1">
                  Database Name <span className="text-cyan-400">*</span>
                </label>
                <input
                  id="dbName"
                  type="text"
                  placeholder="my-database"
                  value={dbName}
                  onChange={(e) => setDbName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-200 
                  focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                  required
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading.initialize}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium 
                  text-gray-900 bg-cyan-400 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 
                  focus:ring-offset-gray-800 focus:ring-cyan-500 disabled:opacity-50 transition-all duration-300
                  shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                >
                  {isLoading.initialize ? "Initializing..." : "Initialize Database"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "set" && (
            <form onSubmit={handleSetCache} className="space-y-4">
              <div>
                <label htmlFor="setDbName" className="block text-sm font-medium text-gray-300 mb-1">
                  Database Name <span className="text-cyan-400">*</span>
                </label>
                <input
                  id="setDbName"
                  type="text"
                  placeholder="my-database"
                  value={dbName}
                  onChange={(e) => setDbName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-200 
                  focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="key" className="block text-sm font-medium text-gray-300 mb-1">
                    Key <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    id="key"
                    type="text"
                    placeholder="cache-key"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-200 
                    focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="ttl" className="block text-sm font-medium text-gray-300 mb-1">
                    TTL (seconds)
                  </label>
                  <input
                    id="ttl"
                    type="number"
                    placeholder="3600"
                    value={ttl}
                    onChange={(e) => setTtl(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-200 
                    focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="value" className="block text-sm font-medium text-gray-300 mb-1">
                  Value <span className="text-cyan-400">*</span>
                </label>
                <textarea
                  id="value"
                  placeholder="Cache value (string, JSON, etc.)"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-200 
                  focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                  required
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading.set}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium 
                  text-gray-900 bg-cyan-400 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 
                  focus:ring-offset-gray-800 focus:ring-cyan-500 disabled:opacity-50 transition-all duration-300
                  shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                >
                  {isLoading.set ? "Setting Cache..." : "Set Cache Value"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "get" && (
            <div>
              <form onSubmit={handleGetCache} className="space-y-4">
                <div>
                  <label htmlFor="getDbName" className="block text-sm font-medium text-gray-300 mb-1">
                    Database Name <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    id="getDbName"
                    type="text"
                    placeholder="my-database"
                    value={dbName}
                    onChange={(e) => setDbName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-200 
                    focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="getKey" className="block text-sm font-medium text-gray-300 mb-1">
                      Key <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      id="getKey"
                      type="text"
                      placeholder="cache-key"
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-200 
                      focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="query" className="block text-sm font-medium text-gray-300 mb-1">
                      Query (optional)
                    </label>
                    <input
                      id="query"
                      type="text"
                      placeholder="JSON path query"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-200 
                      focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading.get}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium 
                    text-gray-900 bg-cyan-400 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 
                    focus:ring-offset-gray-800 focus:ring-cyan-500 disabled:opacity-50 transition-all duration-300
                    shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                  >
                    {isLoading.get ? "Fetching..." : "Get Cache Value"}
                  </button>
                </div>
              </form>

              {cacheValue && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-cyan-400 mb-2">Cache Result:</h3>
                  <div className="bg-gray-900 p-4 rounded-md border border-gray-700 overflow-auto shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap">{cacheValue}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CacheAPIComponent
