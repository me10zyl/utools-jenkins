<template>
  <section data-route="index" id="index">
    <input class="input" placeholder="JOB名称" v-model="filterValue" v-bind:input="onInputSearch"/>
    <a id="jenkinsSetting" href="javascript:void(0)" v-on:click="onClickSetting"
       style="text-decoration: none">Jenkins设置</a>
    <span id="jenkinsURL" >
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
          <!-- <div class="jobBtns row" style="width: 20%">
               <img style="width: 16px; height: 16px; margin-right: 2px;margin-top: 1px" class="buildImg" />
               <a class="build" href="javascript:void(0)">构建</a>
           </div>-->
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
  import utils from "../js/util";
  import utools_dev from "../js/utools_mock";
  import Jenkins from "../js/jenkins";
  import $ from "jquery"
  import moment from "moment"
  import {ThreadPool} from "../js/classutil";
  let utools = window.utools ? window.utools : utools_dev;
  let confList = [];
  utools.onPluginReady(()=>{
    for(let conf of utils.getConfigList()){
      confList.push(conf);
    }
  })
  export default {
    name: 'Jenkins',
    data() {
      return {
        configList: confList,
        jobList: [],
        filterValue: ''
      }
    },
    computed: {
      filterJobList: function () {
        let filter = this.jobList.filter(e => e.name.match(this.filterValue));
        return filter;
      },
      jenkins : function(){
        if(this.configList.length == 0){
          return null;
        }
        let activeConf = this.configList.filter(e => e.data.active)[0];
        let jk = new Jenkins(activeConf.data.url);
        return jk;
      }
    },
    watch: {
      filterValue : {
        handler : function(){

        }
      },
      configList: {
        handler: function (val) {
           this.setJobList()
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
      //this.setJobList();
    },
    methods: {
      onInputSearch : function(){
        $.xhrPool.abortAll();
        this.syncJobDetail(this.filterValue);
      },
      formatDate : function(timestamp){
        if(timestamp){
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
      syncJobDetail : async function(jobList){
        let threadPool = new ThreadPool(5);
        let pool = [];
        for(let job of jobList){
          let runnable = new Promise(r=>{
            let thus = this;
            (async function(job) {
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
          if(!job.lastBuildTime && !job.lastChange) {
            pool.push(runnable)
          }
        }
        threadPool.submitList(pool);
      },
      setJobList: async function () {
        console.log('set job list')
        let {url, username, password} = this.getAuth();
        let jobs = await this.jenkins.listJobs();

        for(let job of jobs.jobs){
          job.lastBuildTime = 'N/A';
          let colorPng = url + "/static/68283e49/images/16x16/" + job.color + ".png";
          if (job.color === 'blue_anime') {
            colorPng = url + "/static/68283e49/images/16x16/" + job.color + ".gif";
          }
          job.colorUrl = colorPng;
        }
        this.jobList = jobs.jobs;
        await new Promise((r)=>{setTimeout(r, 1000)});
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
