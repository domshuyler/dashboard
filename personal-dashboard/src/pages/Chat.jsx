import ReactMarkdown from 'react-markdown'
import { useState, useEffect } from 'react'
import './Chat.css'

function Chat() {
  useEffect(() => { document.title = 'Chat — Dashboard' }, [])

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', content: input }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 1024,
          system: 'You are a helpful personal assistant embedded in the user\'s dashboard. Be concise, practical, and direct.',
          messages: updatedMessages
        })
      })

      const data = await response.json()
      setMessages([...updatedMessages, { role: 'assistant', content: data.content[0].text }])
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="chat-container">
      <h1>Chat</h1>
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">Ask me anything about your tasks, habits, or goals...</div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.role}`}>
            <div className="message-bubble">
              {msg.role === 'assistant'
                ? <ReactMarkdown>{msg.content}</ReactMarkdown>
                : msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-message assistant">
            <div className="message-bubble loading">Thinking...</div>
          </div>
        )}
      </div>
      <div className="chat-input-row">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message your assistant... (Enter to send)"
          rows={1}
        />
        <button onClick={sendMessage} disabled={loading}>Send</button>
      </div>
    </div>
  )
}

export default Chat