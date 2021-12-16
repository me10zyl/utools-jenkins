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

//window.nodeJsReq = nodejsReq


  //for test
 /* (async (nodeJsReq) => {
    const headers_ = {
      "Authorization": "Basic " + "YWRtaW46YWRtaW4=",
      "Content-Type": "application/json;charset=utf-8"
    }
    const url = "http://localhost:8080/jenkins/crumbIssuer/api/json"
    const crumb = await nodeJsReq(url, "GET", headers_)
    console.log('crumb return:', crumb)
    let crumbJson = JSON.parse(crumb.data);
    let crumbValue = crumbJson.crumb;
    let crumbHeader = crumbJson.crumbRequestField;
    console.log('crumb header', crumbHeader);
    console.log('crumb value', crumbValue);
    const headers = {
      "Cookie" :  [crumb.headers['set-cookie'][0].split(";")[0]],
      "Jenkins-Crumb" : crumbValue,
      "Authorization": "Basic " + "YWRtaW46YWRtaW4="
    };
    //headers[crumbHeader] = crumbValue;
    let newurl = "http://localhost:8080/jenkins/job/test-job/descriptorByName/net.uaznia.lukanus.hudson.plugins.gitparameter.GitParameterDefinition/fillValueItems?param=tbranch";
    const result = await nodeJsReq(newurl, "POST", headers)
    console.log('git parameter', result)
  })(nodejsReq)*/
