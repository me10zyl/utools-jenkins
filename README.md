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
3. 随时查看构建进度(百分比显示)
4. 查看最后一次构建的git 日志描述
5. 可配置多个jenkinsURL, 在主页面随意切换, 用于区分测试环境和生产环境的jenkins
6. 修复一些jenkins版本无法显示构建参数的问题

# 关于支持的参数选择类型

由于jenkins各个版本的差异，无法做到完全实现所有参数化构建的所有参数，未支持的参数在后续版本可能添加上，目前支持一些主要的构建参数选择如下：
+ ChoiceParameterDefinition (选择)
+ CascadeChoiceParameter (级联选择器，暂不支持Groovy脚本)
+ TextParameterDefinition （文本输入框）
+ StringParameterDefinition (文本输入框）
+ GitParameterDefinition （git参数)

如果遇到未支持的参数组件，请在留言上标明jenkins的版本，参数组件的类型。

# 更新日志

+ v0.0.1 初始
+ v0.0.2 完全重构, 解决文件夹下的JOB不会出现列表中
+ v0.0.3 新增构建功能，支持无参构建和部分有参构建（文本和选择），新增构建进度展示和增加刷新按钮
+ v0.0.4 修复构建时未授权的BUG
+ v0.0.5 修复有些jenkins版本的参数化构建选项无法显示问题，优化切换配置时jobList的显示效果

# 无法使用的一些建议

如果无法正常使用该插件，请尝试使用以下策略修复：

1. jenkins使用http而不是https
2. 检查jenkins配置中jenkins URL是否设置正确
3. 尝试关闭 jenkins Prevent CSRF

# 提交BUG与建议

[https://github.com/me10zyl/utools-jenkins](https://github.com/me10zyl/utools-jenkins)
