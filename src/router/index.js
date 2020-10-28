import Vue from 'vue'
import Router from 'vue-router'
import Jenkins from "../components/Jenkins";
import Config from "../components/Config";
import utools_dev from "../js/utools_mock"

Vue.use(Router)

let router = new Router({
  routes: [
    {
      path: '/index',
      name: 'Jenkins',
      component: Jenkins
    },
    {
      path: '/config',
      name: 'Config',
      component: Config
    }
  ]
});
router.beforeEach((to, from, next) => {
    console.log(to);
    next();
});


export default router
let utools = window.utools ? window.utools : utools_dev;
utools.onPluginEnter(function ({code, type, payload, optional}) {
  try {
    console.log('plugin enter')
    if (code == 'jenkins') {
      window.location.hash = '/index';
    } else if (code == 'jenkins-set') {
      window.location.hash = '/config';
      console.log('enter config')
    }
  }catch (e) {
    console.error(e)
  }
});
