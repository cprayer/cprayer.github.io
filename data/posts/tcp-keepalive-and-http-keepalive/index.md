---
title: TCP keepalive, HTTP keepalive
createdDate: '2019-12-03'
updatedDate: '2019-12-03'
author: cprayer
tags:
  - k8s
  - TCP
  - HTTP
  - keep-alive
  - network
image: network.jpg
draft: false
---

## TCP keepalive

TCP keepalive는 현재 두 호스트간에 연결되어 있는 TCP 커넥션이 유효한지, 아닌지를 판단할 때 사용됩니다.
이는 서버 어플리케이션에서 유효하지 않은 커넥션을 정리할 때 사용됩니다.

linux에서 제공해주는 TCP Keepalive의 경우 procfs, sysctl(2) 인터페이스를 통해 확인할 수 있고, 3가지 파라미터를 가지고 있습니다. (sysctl(2)의 경우 linux 5.5 kernel에서 사라진다고 합니다. [링크](https://www.phoronix.com/scan.php?page=news_item&px=Linux-5.5-Kills-SYSCTL-SYSCALL))
필요한 경우 TCP 단에서, 혹은 더 상위의 레이어 단의 프로토콜에서 구현해서 사용할 수 있습니다.
여기에서는 linux의 TCP Keepalive를 설명합니다.

procfs의 경우 /proc에 마운트되어 있고,  `/proc/sys/net/ipv4/tcp_keepalive_time(default 7200s)`, `/proc/sys/net/ipv4/tcp_keepalive_intvl(default 75s)`, `/proc/sys/net/ipv4/tcp_keepalive_probes(default 9)`가 있습니다.
`tcp_keepalive_time`과 `tcp_keepalive_intvl`의 경우 초 단위, `tcp_keepalive_probes`의 경우 횟수 단위입니다.
각 파라미터의 의미는 `tcp_keepalive_time`만큼 대기한 이후, probe 패킷을 `tcp_keepalive_intvl`마다 보내고 `tcp_keepalive_probes` 횟수만큼 연속적으로 ACK 응답을 받지 못하면 유효하지 않는 TCP 커넥션이라 판단하고 연결을 끊습니다.

default 값을 예시로 들면 특정 TCP 커넥션에 대해 마지막 데이터 패킷을 받은 이후 7200초를 대기한 뒤 probe 패킷을 75초마다 보내고 9번 연속적으로 ACK 응답을 받지 못하면 유효하지 않는 TCP 커넥션이라 판단한다고 보고 해당 커넥션을 삭제합니다.
probe에 대한 ACK 응답을 받게 된다면 마지막 데이터 패킷을 받고 tcp_keepalive_time만큼 대기한 이후 probe 패킷을 `tcp_keepalive_intvl`마다 보내는 로직을 다시 실행하게 됩니다.

## HTTP keepalive

HTTP keepalive는 TCP 커넥션을 재사용하고자 할 때 사용됩니다.

HTTP keepalive를 설정하지 않으면, 매 번 HTTP 통신이 일어날 때마다 새로운 TCP 커넥션이 생성됩니다.
HTTP Keepalive를 설정하면 기존 TCP 커넥션을 재사용하게 됩니다. (HTTP 1.1에서는 default로 keepalive가 활성화되어 있습니다.)

## 참고 자료

* <http://tldp.org/HOWTO/TCP-Keepalive-HOWTO/usingkeepalive.html>
* <https://en.wikipedia.org/wiki/HTTP_persistent_connection>
