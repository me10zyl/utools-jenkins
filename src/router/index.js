import Vue from 'vue'
import Router from 'vue-router'
import Jenkins from "../components/Jenkins";
import Config from "../components/Config";
import utools_dev from "../js/utools_mock"

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Jenkins',
      component: Jenkins
    },
    {
      path: '/config',
      name: 'Config',
      component: Config
    }
  ]
})
let utools = window.utools ? window.utools : utools_dev;
utools.onPluginEnter(function ({code, type, payload, optional}) {
  try {
    console.log('plugin enter')
    if (code == 'jenkins') {
      window.location.hash = '/';
    } else if (code == 'jenkins-set') {
      window.location.hash = '/config';
      console.log('enter config')
    }
  }catch (e) {
    console.error(e)
  }
});
