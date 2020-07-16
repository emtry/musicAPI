# musicAPI
聚合QQ音乐、网易云 搜索API

搜索数据来源：[jsososo/QQMusicApi](https://github.com/jsososo/QQMusicApi)、[Binaryify/NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)

## Start

```shell
git clone https://github.com/emtry/musicAPI.git

npm run built
//npm run rebuilt 重新部署

npm install

npm start
//npm restart 重启服务
```

项目默认端口为 9852，默认qq号 1234567 (设置Cookie)，可以通过修改 `config.js` 或设置启动参数 `PORT=2589 QQ=7654321 npm start`

## 用前须知

!> 本项目仅供学习使用，请尊重版权，请勿利用此项目从事商业行为!

## 常见问题

1、无法获取音乐链接等，提示未登录

请确保已正确添加QQ账号 Cookie 信息，具体操作可以查看 [设置用户Cookie](#设置用户Cookie)

## 接口文档

### 搜索

#### 搜索
接口：`/search`

参数：

`key`: 关键词 必填

`pageSize`: 返回数量，默认 10

示例：[/search?key=周杰伦](http://127.0.0.1:9852/search?key=周杰伦)

#### 预览
接口：`/preview`

用于预览获取的播放链接，并非返回json格式数据
!> 这个接口是需要登陆 Cookie 才能获取的，不然会返回 301，所以如果有误需要考虑一下可能是 Cookie 过期

参数：

`key`: 关键词 必填

`pageSize`: 返回数量，默认 10

示例：[/search?key=陈奕迅](http://127.0.0.1:9852/preview?key=陈奕迅)

### 播放链接

接口：`/song/url`

参数：

`id`: 歌曲的`songmid` 或 `id`，必填，多个用逗号分割

`type` : qq 或 net ，获取QQ音乐或网易云的播放链接

并不是所有的音乐都能获取到播放链接，如果是未登陆或非 vip 用户的 `cookie`，只能获取到非 vip 用户可听的歌曲，
其他像一些必须要购买数字专辑才能收听的歌曲，如果未购买也是无法获取的，无法获取到的播放链接则不会在返回的对象中出现，

示例：[/song/url?id=002bLdQ92oncT1,002kVQAn270MJZ&type=qq](http://127.0.0.1:9852/song/url?id=002bLdQ92oncT1,002kVQAn270MJZ&type=qq)

[/song/url?id=5256469&type=net](http://127.0.0.1:9852/song/url?id=5256469&type=net)


### 用户信息

#### 设置用户Cookie

接口：`/user/setCookie`

参数：

`data`: 字符串，Cookie 信息，格式如下 `aaa=bbb; ccc=ddd; ....`

该方法仅支持 post 请求，`content-type` 选择 `application/json`，同时，当且仅当传入的 Cookie 为配置的 QQ 号时才会
被作为默认的公用 Cookie 存储使用，各位在搭建自己的服务时记得修改这里的信。参考如下 ![设置Cookie](https://github.com/emtry/musicAPI/raw/master/Cookie.png)

#### 用户主页信息

!> 这个接口是需要登陆 Cookie 才能获取的，不然会返回 301，所以如果有误需要考虑一下可能是 Cookie 过期

接口：`/user/detail`

参数：

`id`: qq号 必填

示例：[/user/detail?id=1234567](http://127.0.0.1:9852/user/detail?id=1234567)

