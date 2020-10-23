import $ from 'jquery'
class Jenkins {

  constructor(baseURL) {
    this.baseURL = baseURL;
    let match = this.baseURL.match(/(.+)\/$/);
    if(match){
      this.baseURL = match[1];
    }
  }

  async listJobs() {
    let result = await $.ajax({
      dataType: 'json',
      url: this.baseURL + "/api/json"
    })
    return result;
  }

  async getJob(jobName) {
    let result = await $.ajax({
      dataType: 'json',
      url: this.baseURL + "/job/" + jobName + "/api/json"
    })
    return result;
  }

  async buildJob(jobName, parameters) {
    if (parameters != null) {

      let result = await $.ajax({
        dataType: 'json',
        type: 'post',
        data: parameters,
        url: this.baseURL + "/job/" + jobName + "/buildWithParameters"
      })
      return result;
    }
  }

  async getLastBuild(jobUrl) {
    let result = await $.ajax({
      dataType: 'json',
      url: jobUrl + "/lastBuild/api/json"
    })
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
