import utools_dev from "../js/utools_mock";
let utools = window.utools ? window.utools : utools_dev;

let utils = {
  getConfigList: function () {
    let allDocs = utools.db.allDocs("jenkins");
    console.log('config list', allDocs)
    let alldata = [];
    let noActive = true;
    for (let i = 0; i < allDocs.length; i++) {
      let data = allDocs[i];
      if(data.data.active){
         noActive = false;
      }
      alldata.push(data);
    }

    if(noActive && alldata.length > 0){
      alldata[0].data.active = true;
    }


    /*if(window.alldata.configList.length === 0) {
    }else{
        window.alldata.configList.push({
          _id: '',
          data: {
            url: null,
            username: null,
            password: null
          }
        });
      }
    }
    if(window.alldata.configList.length === 1 && window.alldata.configList[window.alldata.configList.length-1]._id===''){
      return [];
    }*/
    console.log('alldata', alldata)
    return alldata;
  }
}

export default utils;
