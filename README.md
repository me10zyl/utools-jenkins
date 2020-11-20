# utools-jenkins

+ 使用 `jk-set` 或者 `jenkins-set` 来设置jenkins的URL, 用户名密码(可选)
+ 使用 `jk` 或者 `jenkins` 来搜索jenkins的job

搜索jenkins页面
![jk](https://ftp.bmp.ovh/imgs/2020/09/4b0c4ba5eba88ea2.png)
设置jenkins页面
![jk-config](https://ftp.bmp.ovh/imgs/2020/09/63035699b71fd30f.png)

可支持多个jenkins配置,在主页面点击相应配置可以随时切换。

# 使用教程

先使用`jk-set`设置好jenkins连接，再使用使用`jk`命令实现jenkins的筛序，查看，构建等功能

# 现有功能

1. 可搜索JOB并跳转到jenkins浏览器
2. 可直接构建或参数化构建项目
3. 随时查看构建进度
4. 查看最后一次构建的git 日志描述
5. 可配置多个jenkinsURL, 在主页面随意切换, 用于区分测试环境和生产环境的jenkins

# 更新日志

+ v0.0.1 初始
+ v0.0.2 完全重构, 解决文件夹下的JOB不会出现列表中
+ v0.0.3 新增构建功能，支持无参构建和部分有参构建（文本和选择），新增构建进度展示和增加刷新按钮
+ v0.0.4 修复构建时未授权的BUG
