import ReactMarkdown from 'react-markdown'
import { useState } from 'react'
import './Chat.css'

function Chat() {
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
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 1000,
          system: 'You are a helpful personal assistant built into the user\'s personal dashboard. You help them stay organized, on track with their goals, and productive.',
          messages: updatedMessages
        })
      })

      const data = await response.json()
      const assistantMessage = {
        role: 'assistant',
        content: data.content[0].text
      }
      setMessages([...updatedMessages, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
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