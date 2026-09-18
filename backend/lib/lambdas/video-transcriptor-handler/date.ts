export function getDefaultTTLInSecond() {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const oneDayInSeconds = 24 * 60 * 60;

  return nowInSeconds + oneDayInSeconds;
}
