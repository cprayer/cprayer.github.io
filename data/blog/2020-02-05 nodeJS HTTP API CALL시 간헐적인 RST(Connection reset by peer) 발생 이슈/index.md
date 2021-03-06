---
title: nodeJS HTTP API CALL시 간헐적인 RST(Connection reset by peer) 발생 이슈
createdDate: '2020-02-05'
updatedDate: '2020-02-05'
author: cprayer
tags:
  - troubleshotting
  - network
draft: false
---

## TL; DR

* 클라이언트 - 서버간 연결이 유효하다면, 서버에서 임의로 커넥션을 정리하지 않도록 서버에서 설정한 connection idle timeout 시간보다 더 짧은 주기로 probe / heartbeat 패킷을 보내야 한다.

## 원인 분석

꽤 많은 시간을 삽질하다가 그래도 원인을 몰라, 패킷 덤프를 통해 마지막 요청으로부터 5초 뒤 요청이 들어올 때 문제가 발생하는 것을 확인하고 관련 검색어로 구글링을 하여 원인을 찾았다.
원인은 타이밍 이슈로 서버에서 일정 시간 커넥션에 인입이 없어 커넥션을 정리하는 도중에(이 때, 클라이언트는 아직 FIN 패킷을 받지 못해 커넥션이 유효하다고 판단하여) 클라이언트에서 요청을 보내 RST가 발생하였다.
NodeJS의 http.Server.keepAliveTimeout라는 값이 있고 해당 값의 디폴트 값은 v12.14.1 기준 5초이다. (https://nodejs.org/api/http.html#http_server_keepalivetimeout)

> The number of milliseconds of inactivity a server needs to wait for additional incoming data, after it has finished writing the last response, before a socket will be destroyed. If the server receives new data before the keep-alive timeout has fired, it will reset the regular inactivity timeout (링크 본문 내용 중 일부)

마지막 요청으로부터의 응답을 기준으로 해당 값만큼 대기한 후, 요청이 없으면 커넥션을 종료한다.
별도로 HTTP 프로토콜로 패킷이 인입되어 있는지는 체크하지 않아 TCP KeepAlive Packet이 들어와도 다시 카운트한다.(문서에 따로 나와 있지 않고, 직접 코드를 확인했다. 부정확할 수도 있으니 직접 확인해보는 것이 좋을 듯 싶다.)
해당 값을 서버에 설정된 TCP probe packet 주기보다 넉넉하게 주어 설정한 이후에 테스트했을 때 문제가 발생하지 않았다.
위와 케이스는 조금 다르지만, 커넥션이 Idle 상태에 빠져 원인을 파악하기 힘든 이슈가 발생하는 경우도 있다.

1. 커넥션 풀에서 과도하게 최소 커넥션 개수를 설정하고, 별도 probe / heartbeat 패킷을 보내지 않아 커넥션은 Idle 상태가 되어 서버에서는 해당 커넥션을 계속 정리하고, 커넥션 풀에서는 다시 커넥션을 생성하는 것을 반복
2. 클라이언트 - 방화벽(프록시) - 서버와 같이 중간 단에 중계를 해주는 서버가 존재하고, 커넥션이 Idle 상태에 빠졌을 때 중계(방화벽/프록시)단에서는 해당 세션이 지워져 서버에 새로운 커넥션을 맺고, 서버에는 커넥션 정리 로직이 없어 기존 커넥션이 계속 유지되어 좀비 커넥션 증가

## 결론

실제로 겪어보니, 다양한 곳에서 원인을 찾게 되어 원인 찾기가 어려운 듯 싶다. 기본기가 탄탄해야 될 듯 싶다.