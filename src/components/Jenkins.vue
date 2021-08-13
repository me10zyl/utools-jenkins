<template>
  <section data-route="index" id="index">
    <input class="input" placeholder="JOB名称" v-model="filterValue" v-bind:input="onInputSearch"/>
    <div style="display: flex;justify-content: space-between">
      <a id="jenkinsSetting" href="javascript:void(0)" v-on:click="onClickSetting"
         style="text-decoration: none">Jenkins设置</a>
      <a href="javascript:void(0)" @click="onclickRefresh" style="margin-right: 50px;text-decoration: none">刷新</a>
    </div>
    <span id="jenkinsURL">
          <span class="jk-conf" v-for="config in configList" @click="onSwitchConf(config, configList)">
              <a class="url" href="javascript:void(0)">{{config.data.url}}</a>
              <span v-bind:class="{'activeSpan' : true, 'active' : config.data.active}"></span>
           </span>
     </span>
    <hr/>
    <div style="overflow: auto">
      <ul id="jobs">
        <li class="job" v-for="job in filterJobList">
          <div class="row"
               style="min-width: 40%; width:40%;white-space: nowrap;text-overflow : ellipsis;overflow: hidden">
            <img class="jobColor" width="16" height="16" v-bind:src="job.colorUrl"/>
            <a href="javascript:void(0)" target="_blank" class="jobName" @click="onClickJobName(job)">{{job.name}}</a>
          </div>
          <div class="row" style="width: 140px;margin-left: 10px">
            <span class="lastBuildTime">{{job.lastBuildTime}}</span>
          </div>
          <div class="row"
               style="width: 40%;white-space: nowrap;text-overflow : ellipsis;overflow: hidden;margin-left: 10px">
            <span class="lastChange" v-bind:title="job.lastChange">{{job.lastChange}}</span>
          </div>
          <div class="row" style="margin-right: 10px">
            {{job.progress ? job.progress + '%' : job.progress }}
          </div>
          <div class="jobBtns row" style="width: 20%">
            <img style="width: 16px; height: 16px; margin-right: 2px;margin-top: 1px" class="buildImg"
                 :src="imgs.buildImg"/>
            <a class="build" href="javascript:void(0)" @click="onClickBuildJob(job)">构建</a>
          </div>
        </li>
      </ul>
    </div>
    <el-dialog
      v-if="currentJob"
      :title="currentJob.displayName"
      :visible.sync="buildDialog"
      width="80%"
    >
      <div
        v-if="currentJob.property && currentJob.property.filter(e=>e._class==='hudson.model.ParametersDefinitionProperty').length>0">
        <div>
          参数化构建：
        </div>
        <div>
          <table style="margin-top: 10px">
            <template v-for="param in currentJob.property.filter(e=>e._class==='hudson.model.ParametersDefinitionProperty')[0].parameterDefinitions">
              <tr>
                <td>
                  <label>{{param.name}}</label>
                </td>
                <td>
                  <select v-if="param.type==='ChoiceParameterDefinition' || param.type === 'CascadeChoiceParameter'"
                          v-model="currentJob.form[param.name]">
                    <option v-for="choice in param.choices">{{choice}}</option>
                  </select>
                  <input v-if="param.type==='TextParameterDefinition'||param.type==='StringParameterDefinition'" v-model="currentJob.form[param.name]"/>
                  <select v-if="param._class==='net.uaznia.lukanus.hudson.plugins.gitparameter.GitParameterDefinition'" size="5"
                          v-model="currentJob.form[param.name]">
                      <option v-for="choice in param.choices">{{choice}}</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td></td>
                <td style="font-size: 10px">
                  {{param.description}}
                </td>
              </tr>
            </template>
          </table>
        </div>
      </div>
      <div v-else>构建</div>
      <span slot="footer" class="dialog-footer">
                  <el-button @click="buildDialog = false">取 消</el-button>
                  <el-button type="primary" @click="onDoBuildJob(currentJob)">开始构建</el-button>
            </span>
    </el-dialog>
  </section>
</template>

<script>
  import utils from "../js/util";
  //import utools_dev from "../js/utools_mock";
  import Jenkins from "../js/jenkins";
  import $ from "jquery"
  import moment from "moment"
  import {ThreadPool} from "../js/classutil";

  //let utools = window.utools ? window.utools : utools_dev;
  console.log("utools:", utools)
  /*let confList = [];
  utools.onPluginReady(()=>{
    for(let conf of ){
      confList.push(conf);
    }
  })*/
  export default {
    name: 'Jenkins',
    data() {
      return {
        buildDialog: false,
        currentJob: null,
        configList: utils.getConfigList(),
        jobList: [],
        filterValue: ''
      }
    },
    computed: {
      filterJobList: function () {
        let filter = this.jobList.filter(e => e.name.match(this.filterValue));
        return filter;
      },
      imgs: function () {
        if (this.jenkins) {
          return {
            buildImg: this.jenkins.baseURL + '/static/3f381a23/images/24x24/clock.png'
          }
        }
        return {
          buildImg: ''
        };
      }
    },
    watch: {
      filterValue: {
        handler: function () {
        }
      },
      configList: {
        handler: function (val) {
          if (this.getJenkins()) {
            this.setJobList()
          }
        },
        deep: true
      }
    },
    mounted() {
      $(".input").focus();
      let thus = this;
      $.xhrPool = [];
      $.xhrPool.abortAll = function () {
        $(this).each(function (i, jqXHR) {   //  cycle through list of recorded connection
          console.log('abort', jqXHR)
          jqXHR.abort();  //  aborts connection
          $.xhrPool.splice(i, 1); //  removes from list by index
        });
      }
      $.ajaxSetup({
        beforeSend: function (jqXHR) {
          let {url, username, password} = thus.getAuth();
          $.xhrPool.push(jqXHR);
          jqXHR.setRequestHeader('Content-Type', 'application/json')
          jqXHR.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
        }, //  annd connection to list
        complete: function (jqXHR) {
          var i = $.xhrPool.indexOf(jqXHR);   //  get index for current connection completed
          if (i > -1) $.xhrPool.splice(i, 1); //  removes from list by index
        }
      });
      if (this.getJenkins()) {
        this.setJobList();
      }
    },
    methods: {
      onDoBuildJob: function (job) {
        let {url, username, password} = this.getAuth();
        let auth = "Basic " + btoa(username + ":" + password);
        this.buildDialog = false;
        let isParam = job.actions && job.actions[0] && job.actions[0]._class === 'hudson.model.ParametersDefinitionProperty';
        this.jenkins.buildJob(job.name, isParam ? job.form : null, auth);
        (async ()=>{
          job.color = await this.jenkins.getJobColor(job.name);
          this.updateJobColor(job, true);
        })()
      },
      onclickRefresh : function(){
        this.filterJobList.forEach(async job=>{
          job.color = await this.jenkins.getJobColor(job.name);
          this.updateJobColor(job);
        })
        this.syncJobDetail(this.filterJobList)
      },
      setJobColorUrl : function (job){
        let anime = false;
        let url = this.getCurrentJenkinsUrl();
        let colorPng = url + "/static/68283e49/images/16x16/" + job.color + ".png";
        if (job.color && job.color.match(/anime/)) {
          colorPng = url + "/static/68283e49/images/16x16/" + job.color + ".gif";
          anime = true;
        }
        job.colorUrl = colorPng;
        return anime;
      },
      updateJobColor: function (job, check) {
       if(this.setJobColorUrl(job) || check){
         if (!job.interval || check) {
           job.interval = setInterval(async () => {
             job.color = await this.jenkins.getJobColor(job.name);
             this.setJobColorUrl(job);
             let progress = await this.jenkins.getProgress(job.name);
             this.$set(job, 'progress', progress);
             if(progress > 0 && !job.synced){
               this.syncJobDetailNow(job);
               job.synced = true;
             }
             if (!job.color || !job.color.match(/anime/)) {
               clearInterval(job.interval);
               job.interval = null;
               this.$set(job, 'progress', '');
               job.synced = false;
             }
             console.log(job.progress);
           }, 5000);
         }
       }
      },
      handleGitParameter: async function(job,param){
        if(param._class==='net.uaznia.lukanus.hudson.plugins.gitparameter.GitParameterDefinition'){
          let crumb =  await this.jenkins.getJenkinsCrumb(job.name);
        /*  var parser = new DOMParser();
          var htmlDoc = parser.parseFromString(jobHtml, 'text/html');
          let $jobHtml = $(htmlDoc);*/
          // console.log('html', $jobHtml)
          let crumbValue =  crumb.crumb;
          let crumbHeader = crumb.crumbRequestField;
          console.log('crumb header', crumbHeader);
          console.log('crumb value', crumbValue);
          let headers = {};
          headers[crumbHeader] = crumbValue;
          let result = await $.ajax({
            headers : headers,
            url : job.url + '/descriptorByName/net.uaznia.lukanus.hudson.plugins.gitparameter.GitParameterDefinition/fillValueItems?param=' + param.name,
            dataType : 'json',
            type : 'post'
          })
          console.log('git parameter', result)

        }
      },
      onClickBuildJob: async function (job) {
        if (!job.form) {
          job.form = {}
        }
        let data = await this.jenkins.getJob(job.name);
        job = $.extend(job, data);
        console.log('job',job)
        if (job.property && job.property.filter(e=>e._class==='hudson.model.ParametersDefinitionProperty').length > 0) {
          for (let param of job.property.filter(e=>e._class==='hudson.model.ParametersDefinitionProperty')[0].parameterDefinitions) {
            job.form[param.name] = param.defaultParameterValue ?  param.defaultParameterValue.value : '';
            this.handleGitParameter(job,param)
          }
        }
        this.buildDialog = true;
        this.currentJob = job;
      },
      getJenkins: function () {
        if (!this.configList || this.configList.length === 0) {
          return null;
        }
        console.log('configList jenkins', this.configList)
        let activeConf = this.configList.filter(e => e.data.active)[0];
        let jk = new Jenkins(activeConf.data.url);
        this.jenkins = jk;
        return this.jenkins;
      },
      onInputSearch: function () {
        $.xhrPool.abortAll();
        this.syncJobDetail(this.filterValue);
      },
      formatDate: function (timestamp) {
        if (timestamp) {
          return moment(new Date(timestamp)).format('YYYY-MM-DD HH:mm:ss');
        }
        return 'N/A'
      },
      onClickJobName: function (job) {
        utools.shellOpenExternal(job.url);
      },
      getAuth: function () {
        let config = this.configList.filter(e => e.data.active)[0];
        let url = config && config.data ? config.data.url : null;
        let username = config && config.data ? config.data.username : null;
        let password = config && config.data ? config.data.password : null;
        return {url, username, password}
      },
      getSyncJobDetailRunnable: function (job) {
        let runnable = new Promise(r => {
          let thus = this;
          (async function (job) {
            let lastBuild = await thus.jenkins.getLastBuild(job.url);
            let time = thus.formatDate(lastBuild.timestamp);
            if (lastBuild.changeSet && lastBuild.changeSet.items.length > 0) {
              let lastmsg = lastBuild.changeSet.items[lastBuild.changeSet.items.length - 1];
              let lastmsgFinal = lastmsg.msg + " (" + lastmsg.authorEmail + ")";
              job.lastChange = lastmsgFinal;
            }
            job.lastBuildTime = time;
            r();
          })(job)
        })
        return runnable;
      },
      syncJobDetailNow: function(job){
        let promise = this.getSyncJobDetailRunnable(job);
        promise.then(()=>{

        })
      },
      syncJobDetail: async function (jobList) {
        let threadPool = new ThreadPool(5);
        let pool = [];
        for (let job of jobList) {
          let runnable = this.getSyncJobDetailRunnable(job);
          if (!job.lastBuildTime && !job.lastChange) {
            pool.push(runnable)
          }
        }
        threadPool.submitList(pool);
      },
      getCurrentJenkinsUrl: function () {
        let {url, username, password} = this.getAuth();
        return url;
      },
      setJobList: async function () {
        console.log('set job list')
        this.jobList = []
        let {url, username, password} = this.getAuth();
        let jobs = {
          jobs: []
        };
        try {
          jobs = await this.jenkins.listJobs()
        } catch (e) {
          console.error(e)
        }
        for (let job of jobs.jobs) {
          job.lastBuildTime = 'N/A';
          this.updateJobColor(job);
        }
        this.jobList = jobs.jobs;
        await new Promise((r) => {
          setTimeout(r, 1000)
        });
        this.syncJobDetail(this.jobList);
      },
      onClickSetting: function () {
        utools.redirect('jenkins-set', '')
      },
      onSwitchConf: async function (conf, confList) {
        conf.data.active = true;
        confList.filter(e => e !== conf).forEach(e => e.data.active = false);

        this.configList.forEach((e) => {
          utools.db.put({
            "_id": e._id,
            "data": e.data,
            "_rev": e._rev
          })
        })
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  .input {
    width: 100%;
    height: 50px;
    border: none;
    outline: none;
    font-size: 20px;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .row {

  }

  a {
    text-underline: none;
    color: #453838;
  }

  .jk-conf {
    display: block;
  }

  .active:before {
    content: "*";
  }


  .job {
    justify-content: flex-start;
    display: flex;
    flex-wrap: nowrap;
    flex-direction: row;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  #cloneSetting {
    display: none;
  }

</style>
