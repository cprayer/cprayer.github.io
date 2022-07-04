---
title: 강제로 레플리카 레디스를 마스터로 승격시키기
createdDate: '2022-07-04'
updatedDate: '2022-07-04'
author: cprayer
tags:
  - redis
  - redis-sentinel
draft: false
---
  
## 요약

센티널이 failover-abort-no-good-slave 경고와 함께 페일 오버를 수행하지 못하는 경우 직접 관련된 레플리카 레디스에 들어가 replicaof no one 명령어를 통해 마스터로 승격시키자

## 본문

레디스 센티널은 내부적으로 마스터가 odown으로 판단되었을 때, replicaof no one 명령어를 통해 페일오버를 수행하여 레플리카를 마스터로 승격시킨다 

> For a failover to be considered successful, it requires that the Sentinel was able to send the REPLICAOF NO ONE command to the selected replica, and that the switch to master was later observed in the INFO output of the master.
([관련 링크](https://redis.io/docs/manual/sentinel/#configuration-propagation))

하지만 모든 레플리카가 아래와 같은 이유로 마스터로 승격시키기에 적합하지 않은 경우가 발생할 수 있다
> A replica that is found to be disconnected from the master for more than ten times the configured master timeout (down-after-milliseconds option), plus the time the master is also not available from the point of view of the Sentinel doing the failover, is considered to be not suitable for the failover and is skipped. ([관련 링크](https://redis.io/docs/manual/sentinel/#replica-selection-and-priority))

이 때 레디스 센티널은 failover-abort-no-good-slave 경고와 함께 별도로 페일오버를 수행하지 않는다 \
이 경우에는 직접 레플리카를 마스터로 승격시켜줘야 되는데 replicaof no one 명령어를 통해 마스터로 승격시킬 수 있다
