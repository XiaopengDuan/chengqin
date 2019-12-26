const state = {
        name: '',
        token: '',
        jurisdiction: '',
        roles: [],
        menuPerms: [],
        thispath: '',
      }
const mutations = {
        SET_TOKEN: (state, token) => {
          state.token = token
        },
        USER_NAME: (state, name) => {
          state.name = name
        },
        JURISDICTION: (state, index) => {
          state.jurisdiction = index
        },
        SET_ROLES: (state, roles) => {
          state.roles = roles
        },
        SET_MENUPERMS: (state, menuPerms) => {
          state.menuPerms = menuPerms
        },
        THISPATH: (state, path) => {
          state.thispath = path
        }
      }
const actions = {
        
      }
  export default {
    namespaced: true,
    state,
    mutations,
    actions
  }
