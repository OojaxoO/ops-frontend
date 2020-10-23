let padDate = function (va) {
    va = va < 10 ? '0' + va : va
    return va
}

export const formatDate = (val, offset, type="time") => {
  offset = offset || 0
  if (!val) {
    return ''
  }
  let value = new Date(new Date(val).getTime() + offset)
  let year = value.getFullYear()
  let month = padDate(value.getMonth() + 1)
  let day = padDate(value.getDate())
  let hour = padDate(value.getHours())
  let minutes = padDate(value.getMinutes())
  let seconds = padDate(value.getSeconds())
  if (type == "time") {
    return year + '-' + month + '-' + day + ' ' + hour + ':' + minutes + ':' + seconds
  }
  if (type == "datetime") {
    return year + '-' + month + '-' + day
  }
}
