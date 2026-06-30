import { useEffect, useState } from 'react'
import './App.css'

// Fetch a batch so we can locally skip banned dogs without hammering the API.
const API_URL =
  'https://api.thedogapi.com/v1/images/search?has_breeds=1&include_breeds=true&limit=20'
const API_KEY = import.meta.env.VITE_DOG_API_KEY

function App() {
  const [dog, setDog] = useState(null)
  const [loading, setLoading] = useState(false)
  // Each ban is { type: 'breed' | 'origin', value: string }
  const [bans, setBans] = useState([])

  function isBanned(breed, banList) {
    if (!breed) return false
    return banList.some((b) => {
      if (b.type === 'breed') return breed.name === b.value
      if (b.type === 'origin') return breed.origin && breed.origin === b.value
      return false
    })
  }

  function addBan(type, value) {
    if (!value) return
    setBans((prev) =>
      prev.some((b) => b.type === type && b.value === value)
        ? prev
        : [...prev, { type, value }]
    )
  }

  function removeBan(type, value) {
    setBans((prev) => prev.filter((b) => !(b.type === type && b.value === value)))
  }

  async function fetchDog() {
    setLoading(true)
    try {
      // Try a few batches before giving up (handles broad ban lists).
      for (let attempt = 0; attempt < 5; attempt++) {
        const res = await fetch(API_URL, { headers: { 'x-api-key': API_KEY } })
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const data = await res.json()

        const match = data.find(
          (d) => d.breeds?.[0] && !isBanned(d.breeds[0], bans)
        )
        if (match) {
          setDog(match)
          return
        }
      }
      console.warn('Could not find an unbanned dog after several tries.')
    } catch (err) {
      console.error('Failed to fetch dog:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDog()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const breed = dog?.breeds?.[0]

  return (
    <div className="app">
      <h1>🐶 StumbleUpon Dogs</h1>

      <div className="layout">
        <div className="left">
          <div className="card">
            {dog ? (
              <>
                <img
                  className="dog-img"
                  src={dog.url}
                  alt={breed?.name ?? 'A random dog'}
                />
                {breed ? (
                  <ul className="attributes">
                    <li>
                      <span className="label">Breed</span>
                      <button
                        className="value attr-clickable"
                        title="Click to ban this breed"
                        onClick={() => addBan('breed', breed.name)}
                      >
                        {breed.name}
                      </button>
                    </li>
                    <li>
                      <span className="label">Temperament</span>
                      <span className="value">{breed.temperament ?? 'Unknown'}</span>
                    </li>
                    <li>
                      <span className="label">Life span</span>
                      <span className="value">{breed.life_span ?? 'Unknown'}</span>
                    </li>
                    <li>
                      <span className="label">Origin</span>
                      {breed.origin ? (
                        <button
                          className="value attr-clickable"
                          title="Click to ban this origin"
                          onClick={() => addBan('origin', breed.origin)}
                        >
                          {breed.origin}
                        </button>
                      ) : (
                        <span className="value">Unknown</span>
                      )}
                    </li>
                  </ul>
                ) : (
                  <p className="no-breed">No breed info for this one 🐾</p>
                )}
              </>
            ) : (
              <div className="placeholder">
                {loading ? 'Fetching a good boy…' : 'No dog yet'}
              </div>
            )}
          </div>

          <button className="discover-btn" onClick={fetchDog} disabled={loading}>
            {loading ? 'Loading…' : 'Discover'}
          </button>
        </div>

        <aside className="ban-list">
          <h2>🚫 Ban List</h2>
          {bans.length === 0 ? (
            <p className="ban-empty">
              Click a dog&apos;s breed or origin to ban it. Banned values won&apos;t show up
              again.
            </p>
          ) : (
            <ul className="ban-chips">
              {bans.map((b) => (
                <li key={`${b.type}:${b.value}`}>
                  <button
                    className="ban-chip"
                    title="Click to remove from ban list"
                    onClick={() => removeBan(b.type, b.value)}
                  >
                    <span className="ban-chip-type">{b.type}</span>
                    {b.value}
                    <span className="ban-chip-x">×</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  )
}

export default App
