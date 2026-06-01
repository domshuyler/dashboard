/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from 'react'
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './Calendar.css'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'en-US': enUS }
})

function Calendar({ calendarEvents, setCalendarEvents }) {
  const [token, setToken] = useState(() => localStorage.getItem('google_token'))
  const [loading, setLoading] = useState(false)

  const login = () => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=${SCOPES}`
    window.location.href = authUrl
  }

  const logout = useCallback(() => {
    localStorage.removeItem('google_token')
    setToken(null)
    setCalendarEvents([])
  }, [])

  const fetchEvents = useCallback(async (accessToken) => {
    setLoading(true)
    try {
      const calListResponse = await fetch(
        'https://www.googleapis.com/calendar/v3/users/me/calendarList',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      if (calListResponse.status === 401) {
        logout()
        return
      }
      const calList = await calListResponse.json()
      const calendars = calList.items || []

      const now = new Date().toISOString()
      const allEvents = await Promise.all(
        calendars.map(cal =>
          fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cal.id)}/events?timeMin=${now}&maxResults=50&singleEvents=true&orderBy=startTime`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          ).then(res => res.json()).then(data =>
            (data.items || []).map(event => ({
              ...event,
              calendarColor: cal.backgroundColor
            }))
          )
        )
      )

      const merged = allEvents.flat()
        .filter(event => event.start)
        .map(event => ({
          id: event.id,
          title: event.summary || 'No title',
          start: new Date(event.start.dateTime || event.start.date),
          end: new Date(event.end.dateTime || event.end.date),
          location: event.location,
          color: event.calendarColor
        }))
        .sort((a, b) => a.start - b.start)

      setCalendarEvents(merged)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }, [logout])

  useEffect(() => {
    if (token) fetchEvents(token)
  }, [])

  return (
    <div className="page calendar-page">
      <div className="calendar-header">
        <h1>Calendar</h1>
        {token
          ? <button className="logout-btn" onClick={logout}>Disconnect</button>
          : <button className="connect-btn" onClick={login}>Connect Google Calendar</button>
        }
      </div>

      {!token && (
        <div className="calendar-empty">
          <p>Connect your Google Calendar to see your upcoming events.</p>
        </div>
      )}

      {token && loading && (
        <div className="calendar-empty">
          <p>Loading events...</p>
        </div>
      )}

      {token && !loading && (
        <BigCalendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.color || 'var(--color-accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: '500'
            }
          })}
        />
      )}
    </div>
  )
}

export default Calendar