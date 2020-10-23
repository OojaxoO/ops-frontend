export const url = "/api/user" 

export function list(that) {
    return that.$axios.get(`${url}?page=${that.page}&pageSize=${that.pageSize}&search=${that.value}`)
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