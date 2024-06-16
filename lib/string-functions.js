const replaceAll = (string_, search, replace) => {
  return string_.split(search).join(replace)
}

const tryToClean = (string_) => {
  try {
    return string_.trim().split(" ").join("-").toLowerCase()
  } catch (error) {
    console.log(error)
    return string_
  }
}

export { replaceAll, tryToClean}