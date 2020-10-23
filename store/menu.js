import menu from '~/menu/menu'

export const state = () => ({
  menu: []
})

export const getters = {
  get (state, getters, rootState) {
    return getUserMenu(menu, rootState.auth.user) 
  }
}

const getUserMenu = (menu, user) => {
  let res = []
  if (!user) {
    return res 
  }
  let admin = user.is_superadmin || false
  menu.forEach(item => {
    if (!item.hide) {
      let obj = {
        name: item.name,
        icon: item.icon,
        path: item.path
      }
      if (hasChild(item) && showThisMenuEle(item, admin)) {
        obj.children = getUserMenu(item.children, user)
      }
      if (showThisMenuEle(item, admin)) res.push(obj)
    }
  })
  return res
}

const hasChild = (item) => {
  return item.children && item.children.length
}

const showThisMenuEle = (item, admin) => {
  return (!item.admin || admin)
}