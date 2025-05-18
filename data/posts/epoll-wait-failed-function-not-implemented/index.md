---
title: "netty epoll_wait(..) failed: Function not implemented 에러 이슈 해결 방법"
createdDate: '2025-05-18'
updatedDate: '2025-05-18'
author: cprayer
tags:
  - netty
  - ubuntu
draft: false
---

## TL; DR

epoll_wait(..) failed: Function not implemented가 발생하면 netty 4.1.77.Final 이상 버전을 사용

## 원인 분석

```
io.netty.channel.epoll.EpollEventLoop : Unexpected exception in the selector loop.
io.netty.channel.unix.Errors$NativeIoException: epoll_wait(..) failed: Function not implemented

reactor.netty.http.client.HttpClient USER_EVENT: SslHandshakeCompletionEvent(io.netty.handler.ssl.SslHandshakeTimeoutException: handshake timed out after 10000ms)
```

이런 에러가 발생하였는데, 코드 레벨에서 변경이나 라이브러리 버전 변경이 없었음에도 에러가 발생하였습니다
변경사항을 좀 더 살펴보던 도중 docker base image의 ubuntu 버전을 20.04에서 22.04로 올렸던 변경 사항이 있던 것을 확인하여 다른 변경 사항은 그대로 둔 채 base image 버전을 원복하자 정상 작동하는 것을 확인할 수 있었습니다

## 이슈 원인

관련하여 구글링을 해보니 https://github.com/netty/netty/issues/12343 와 같은 이슈가 등록되어 있었고 netty의 버전을 4.1.77.Final 이상 버전으로 사용하면 ubuntu 22.04 를 사용하더라도 이슈가 없다고 합니다

epoll_pwait2 시스템 콜 인터페이스는 존재하나 실제로 구현이 안되어 있는 케이스가 발생하여 그렇다고 합니다
```
Its possible that while there is an epoll_pwait2(...) system call it is not implemented and so fail with ENOSYS.
``` 

