
const url = "/api/project/config" 

export function list(that) {
    return that.$axios.get(`${url}?app_id=${that.app_id}`)
}

export function create(that) {
    return that.$axios.post(url, that.formData)
}

export function update(that) {
    let {ID, ...data} = that.formData
    return that.$axios.put(`${url}/${ID}`, data)
}

export function _delete(that, ID) {
    return that.$axios.delete(`${url}/${ID}`)
}