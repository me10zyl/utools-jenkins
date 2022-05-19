import $ from 'jquery'
import ca from "element-ui/src/locale/lang/ca";

class Jenkins {

  constructor(baseURL, username, password) {
    this.baseURL = baseURL;
    let match = this.baseURL.match(/(.+)\/$/);
    if(match){
      this.baseURL = match[1];
    }
    this.username = username
    this.password = password
  }

  async listJobs(url) {
    console.log('listJobs', url)
    let result = await $.ajax({
      dataType: 'json',
      url: (url ? url : this.baseURL) + "/api/json"
    })
    for(let job of result.jobs){
      if(job._class === 'com.cloudbees.hudson.plugins.folder.Folder'){
          console.log('job url' , job.url)
          let concatjobs = await this.listJobs(job.url);
          console.log('concatjobs', concatjobs.jobs)
          result.jobs = result.jobs.concat(concatjobs.jobs)
      }
    }
    console.log('list jobs result:', url, result)
    return [url, result];
  }

  async getJob(jobName) {
    let result = await $.ajax({
      dataType: 'json',
      url: this.baseURL + "/job/" + jobName + "/api/json"
    })
    return result;
  }

  async crumbRequest(requestUrl){
    const headers = {
      "Authorization" : "Basic " + btoa(this.username + ":" + this.password),
      "Content-Type" : "application/json;charset=utf-8"
    }
    try {
      const url = this.baseURL + "/crumbIssuer/api/json"
      const crumb = await nodeJsReq(url, "GET", headers)
      let crumbJson = JSON.parse(crumb.data);
      let crumbValue = crumbJson.crumb;
      let crumbHeader = crumbJson.crumbRequestField;
      Object.assign(headers, {
        'Cookie': crumb.headers['set-cookie'][0].split(";")[0]
      });
      headers[crumbHeader] = crumbValue;
    }catch (e){
      console.error('crumb error', e);
    }
    let ret = await nodeJsReq(requestUrl, "POST", headers);
    console.log('crumb request result: with url ' + requestUrl, ret)
    return ret;
  }

  async getJobColor(jobName){
    let result = await $.ajax({
      dataType: 'json',
      url: this.baseURL + "/job/" + jobName + "/api/json?tree=color"
    })
    let color = result.color;
    console.log('get job color', jobName, color)
    return color;
  }

  async buildJob(jobName, parameters, authString) {
    // let httpRequest = new XMLHttpRequest();
    console.log(jobName + " start build with param:", this.baseURL + "/job/" + jobName, parameters)
    if (parameters != null) {
      let string = "";
      for(let key in parameters){
        if(key && key.trim() != "") {
          string += "&" + key + "=" + parameters[key];
        }
      }
      string = '?' + string.substring(1);
      await this.crumbRequest(this.baseURL + "/job/" + jobName + "/buildWithParameters" + string).catch(e=>console.error(e));
    }else {
      await this.crumbRequest(this.baseURL + "/job/" + jobName + "/build").catch(e=>console.error(e));
    }
    // httpRequest.setRequestHeader("Authorization", authString)
    // httpRequest.setRequestHeader( "content-type", "application/x-www-form-urlencoded")
    // httpRequest.send();
  }

  async ajaxJob(jobName){
    const url = this.baseURL + "/job/" + jobName + "/buildHistory/ajax"
    const result = await this.crumbRequest(url)
    return result.data;
  }

  async getAjaxJobColorSrc(jobName){
    let text = await this.ajaxJob(jobName);
    let img = $(text).find("tr .build-icon:eq(0)>img");
    if(img.length === 0){
      return null
    }
    let colorUrl = img.attr("src");
    return this.baseURL.replace(/(\w)\/.+/, "$1") + colorUrl;
  }

  async isBuildDone(jobName){
    let text = await this.ajaxJob(jobName);
    let isBuilding = $(text).find("tr:eq(0)").hasClass('transitive')
    if(!isBuilding){
      console.log('done.')
    }
    return isBuilding;
  }

  async getProgress(jobName){
    let text = await this.ajaxJob(jobName);
    let find = $(text).find(".progress-bar-done");
    let isBuilding = $(text).find("tr:eq(0)").hasClass('transitive')
    if(!isBuilding) {
      return -1;
    }
    if(find.length === 0){
      return 0
    }
    return parseInt(find[0].style.width);
  }

  async getLastBuild(jobUrl) {
    let jqXHR = $.ajax({
      dataType: 'json',
      url: jobUrl + "/lastBuild/api/json"
    });
    if(!this.jqXHRList) {
      this.jqXHRList = []
    }
    this.jqXHRList.push(jqXHR);
    let result = await jqXHR
    return result;
  }

  async getBuild(buildURL) {
    if (!buildURL) {
      return null;
    }
    let result = await $.ajax({
      dataType: 'json',
      url: buildURL + "/api/json"
    })
    return result;
  }
}

export default Jenkins
