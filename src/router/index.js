import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

export const constantRoutes = [
    {   
        path: '/index',
        name: 'index',
        component: () => import('@/views/index'),
        redirect: { name: 'Businessbigdataanalysis' },
        children: [ 
            { 
                path: '/Businessbigdataanalysis',
                name: 'Businessbigdataanalysis',
                component: () => import('@/views/Businessbigdataanalysis'),
                hidden: true,
                eta: {} 
            },{ 
                path: '/Networkanalysis',
                name: 'Networkanalysis',
                component: () => import('@/views/Networkanalysis'),
                hidden: true,
                meta: {} 
            }
        ]
    },
    { path: '/', redirect: { name: 'index' } }
]
//*************************************************************

const createRouter = () => new Router({
  mode: 'history', // require service support
  // scrollBehavior: () => ({y: 0}),
  routes: constantRoutes
})
const router = createRouter()

export default router
