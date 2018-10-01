import Vue from 'vue'
import VueRouter from 'vue-router'

import Login from '../components/login/login'
import Registration from '../components/registration/registration'

Vue.use(VueRouter);

export default new VueRouter({
  routes: [
    { path: '/', redirect: { name: 'login' }},
    { path: '/login', name: 'login', component: Login },
    { path: '/registration', name: 'registration', component: Registration },
  ]
})