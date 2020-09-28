window.loadConfigPage = function () {
    utools.redirect('jenkins-set', '')
}
utools.onPluginEnter(({code, type, payload, optional}) => {
    console.log('用户进入插件', code, type, payload)
    if(code === 'jenkins-set'){
        document.write(require('fs').readFileSync(location.href.replace("file:///", "").replace('index.html', 'jenkins-config.html')))
    }
})
