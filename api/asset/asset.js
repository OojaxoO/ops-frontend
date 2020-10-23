
const url = "/api/asset" 

export function info(that) {
    return that.$axios.get(`${url}?PrimaryIpAddress=${that.value}`)
}