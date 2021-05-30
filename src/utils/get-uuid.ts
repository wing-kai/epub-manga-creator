const generateRandomUUID = () => {
  const char = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"

  let uuid = ""
  let i = 36

  while (i-- > 0) {
    if (i === 27 || i === 22 || i === 17 || i === 12) {
      uuid = uuid + "-"
    } else {
      uuid = uuid + String(char[Math.ceil(Math.random() * 35)])
    }
  }

  return uuid
}

export default generateRandomUUID