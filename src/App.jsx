import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'https://api.thedogapi.com/v1/images/search?has_breeds=1&limit=1'
const API_KEY = import.meta.env.VITE_DOG_API_KEY

function App() {
  const [dog, setDog] = useState(null)
  const [loading, setLoading] = useState(false)

  async function fetchDog() {
    setLoading(true)
    try {
      const res = await fetch(API_URL, {
        headers: { 'x-api-key': API_KEY },
      })
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const data = await res.json()
      setDog(data[0])
    } catch (err) {
      console.error('Failed to fetch dog:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDog()
  }, [])

  return (
    <div className="app">
      <h1>🐶 StumbleUpon Dogs</h1>

      <div className="card">
        {dog ? (
          <img className="dog-img" src={dog.url} alt="A random dog" />
        ) : (
          <div className="placeholder">{loading ? 'Fetching a good boy…' : 'No dog yet'}</div>
        )}
      </div>

      <button className="discover-btn" onClick={fetchDog} disabled={loading}>
        {loading ? 'Loading…' : 'Discover'}
      </button>
    </div>
  )
}

export default App
