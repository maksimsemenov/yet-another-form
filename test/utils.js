export const createEvent = (eventName, target) => {
  const event = new Event(eventName)
  Object.defineProperty(event, 'target', { value: target })
  return event
}
