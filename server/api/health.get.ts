export default defineEventHandler((event) => {
  return setResponseStatus(event, 200), { message: 'ok' };
})
