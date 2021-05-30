const deepClone = (target) => {
  if (target && typeof target === 'object') {
    const newObj = target instanceof Array ? [] : target instanceof Date ? new Date(+target) : {}
    for (const key in target) {
      const val = target[key]
      newObj[key] = deepClone(val)
    }
    return newObj
  }

  return target
}

export default deepClone
