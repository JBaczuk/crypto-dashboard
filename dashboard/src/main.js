import Vue from 'vue'
import BootstrapVue from "bootstrap-vue"
import App from './App.vue'
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-vue/dist/bootstrap-vue.css"
import Chartkick from 'chartkick'
import VueChartkick from 'vue-chartkick'
import Chart from 'chart.js'

Vue.use(BootstrapVue)
Vue.use(VueChartkick, { Chartkick })

new Vue({
  el: '#app',
  render: h => h(App)
})
