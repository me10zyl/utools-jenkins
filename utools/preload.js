//由于 jenkins csrf 限制,无法使用js的http请求,只能使用nodejs的 http 请求
async function nodejsReq(url, method, headers) {
  const schema = new RegExp("^(http(?:s)?)://").exec(url)[1]
  let hostname = new RegExp("^http(?:s)?://(.+?)(:\\d+)?/").exec(url)[1];
  let tmp = new RegExp("^http(?:s)?://.+?:(\\d+)").exec(url);
  const port = tmp ? parseInt(tmp[1]) : 80;
  let path = new RegExp("^http(?:s)?://.+?(:\\d+)?(/.+)").exec(url)[2];
  const http = schema === "http" ? require('http') : require('https');
  const options = {
    hostname: hostname,
    port: port,
    headers: headers || {},
    path: path,
    method: method
  }
  console.log('request with options:', schema, options)

  return new Promise((r1, r2) => {
    const req = http.request(options, async function (res) {

      res.on('data', d => {
        const headers = res.headers;

        r1({
          headers: headers,
          data: d.toString()
        })
      });
    });
    req.on('error', error => {
      r2(error);
    })
    req.end()
  });
}

window.nodeJsReq = nodejsReq
