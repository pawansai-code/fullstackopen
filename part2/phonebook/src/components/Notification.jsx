const Notification = ({ message }) => {
  if (message === null) {
    return null
  }

  // To cleanly support the "Green message" requested, we detect the message content.
  const className = message.includes('Added') || message.includes('Updated') ? 'success' : 'error'

  return (
    <div className={className}>
      {message}
    </div>
  )
}

export default Notification
