<template>
  <section data-route="config" id="config">
    <div class="settings">
      <div class="setting box11 shadow" v-for="(config, index) in configList">
        <input placeholder="jenkins url" class="input" name="jkUrl" v-model="config.data.url"
               v-on:input="onInput(config, index)"/>
        <hr/>
        <input placeholder="jenkins username(optional)" class="input" name="jkUsername"
               v-model="config.data.username" v-on:input="onInput(config, index)"/>
        <hr/>
        <input placeholder="jenkins password(optional)" class="input" name="jkPassword"
               v-model="config.data.password" v-on:input="onInput(config, index)"/>
      </div>
    </div>
    <div>
      <a href="javascript:void(0)" id="sub" v-on:click="subConf"
         style="float: right;display: block;width: 70px">减少配置</a>
      <a href="javascript:void(0)" id="add" v-on:click="addConf"
         style="float: right;display: block;width: 70px">增加配置</a>
      <a href="javascript:void(0)" id="returnBack" v-on:click="returnBack"
         style="float: right;display: block;width: 140px">返回Jenkins搜索</a>
    </div>
  </section>

</template>

<script>
  import utools_dev from "../js/utools_mock";
  let utools = window.utools ? window.utools : utools_dev;
  function getConfList(){
    let allDocs = utools.db.allDocs("jenkins");
    let ret = [];
    if (allDocs.length > 0) {
      for (let i = 0; i < allDocs.length; i++) {
        let data = allDocs[i];
        ret.push(data);
      }
    }else{
      ret.push({
        _id: '',
        data: {
          url: null,
          username: null,
          password: null
        }
      });
    }
    return ret;
  }
  export default {
    name: "Config",
    data : ()=>{
      return {
        configList : getConfList()
      }
    },
    created() {

    },
    methods: {
      onInput: function (conf, index) {
        let value = utools.db.get("jenkins-" + index);
        let data = {
          _id: "jenkins-" + index,
          data: {
            url: conf.data.url,
            username: conf.data.username,
            password: conf.data.password
          },
          _rev: value == null ? null : value._rev
        };
        data._rev || delete data._rev
        utools.db.put(data);
      },
      subConf: function () {
        console.log(this.configList.length)
        let lastIndex = this.configList.length - 1;
        this.configList.splice(lastIndex, 1);
        utools.db.remove("jenkins-" + lastIndex);
      },
      addConf: function () {
        this.configList.push({
          _id: '',
          data: {
            url: null,
            username: null,
            password: null
          }
        })
      },
      returnBack: function () {
        utools.redirect('jenkins', '')
      }
    }
  }
</script>

<style scoped>
  .input {
    width: 100%;
    height: 50px;
    border: none;
    outline: none;
    font-size: 20px;
  }

  @media (prefers-color-scheme: dark) {

  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .row {
    display: inline-block;
  }

  a {
    text-underline: none;
    color: #453838;
    text-decoration: none;
  }

  .setting {
    padding: 10px;
    font-size: 16px;
  }

  .box11 {
    border-radius: 10px;
    margin: 10px;
  }

  .shadow {
    position: relative;
    box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.3),
    0px 0px 20px rgba(0, 0, 0, 0.1) inset;
  }

  @media (prefers-color-scheme: dark) {
    .input {
      width: 100%;
      height: 50px;
      border: none;
      outline: none;
      font-size: 20px;
      background-color: transparent;
      caret-color: white;
      color: white;
    }

    .setting{
      padding: 10px;
      font-size: 16px;
      border:1px solid white;
    }

    .shadow {
      position: relative;
      box-shadow: 0px 1px 4px rgba(255, 255, 255, 0.3),
      0px 0px 20px rgba(255, 255, 255, 0.1) inset;
    }

    a {
      text-underline: none;
      color: white;
      text-decoration: none;
    }

  }
</style>
