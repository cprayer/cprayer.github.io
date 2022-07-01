---
title: dbcp2 pool idle configuration이 있는데도 communicationsException 발생 원인 파악
createdDate: '2021-09-23'
updatedDate: '2021-09-23'
author: cprayer
tags:
  - dbcp2
  - communicationsException
  - troubleshooting
draft: false
---

db 커넥션은 연결 및 해제하는데 많은 비용이 들어갑니다. 따라서 하나의 쿼리를 날릴 때 커넥션을 연결하고 쿼리를 날린 뒤 해제하는 것이 아니라 해당 커넥션을 재사용하기 위해 커넥션 풀을 사용하는데요. 해당 기능이 구현되어 있는 라이브러리 중 하나인 dbcp2를 회사 프로젝트에서 사용하고 있습니다.

현재 운영하고 있는 서비스는 서비스 특성상 순간적으로 많은 트래픽이 발생하여 순간적으로 많은 커넥션이 필요한 경우가 있는데요. \
이 때, 순간적으로 많은 커넥션이 생성되는 것이 아닌 기존에 생성해둔 커넥션을 사용하기 위해 minIdle 값을 높게 설정하여 풀 내에 가용 가능한 커넥션을 많이 준비해두었습니다. \
또 minIdle 커넥션으로 부족한 경우를 위해 maxTotal 값을 minIdle 값보다 크게 설정해두었습니다

dbcp2의 경우 pool에 커넥션을 넣고 꺼낼 때 default로 lifo(last in first out)를 사용하여 최근에 사용한 커넥션이 다시 재사용됩니다. 이 경우 커넥션 풀에서 장시간 사용되지 않는 커넥션이 발생할 수 있는데요. 이 경우 (현재 회사에서 사용하고 있는 rdb인) mysql은 wait_timeout 설정 값동안 커넥션에서 쿼리가 발생하지 않는 경우 해당 커넥션을 정리합니다.

위 로직에 의해 서버에서 커넥션을 정리하지 않도록 하기 위해 testWhileIdle를 true로 하여 주기적으로 evictor에 의해 validation query가 날라갈 수 있도록 DataSource 설정을 해두었습니다.

<center>

| configuration name            | value         |
|-------------------------------|---------------|
| minIdle                       | 10            |
| maxTotal                      | 10            |
| numTestsPerEvictionRun        | 1             |
| validationQuery               | select 1      |
| testWhileIdle                 | true          |
| timeBetweenEvictionRunsMillis | 1000 * 60     |
| minEvictableIdleTimeMillis    | 1000 * 60 * 5 |

(위 값은 임의로 설정한 값이며 실제로는 해당 값으로 상용 환경에 설정하지 않았습니다.)

</center>

위와 같은 설정에서 평시 트래픽에서는 커넥션이 1-2개 가량만 주로 사용되다가, 갑자기 피크가 치는 경우 커넥션 풀에서 많은 커넥션이 사용되었는데요. \
이 때, 다음과 같은 예외가 발생했다고 알림이 왔습니다.

```
Exception in thread "main" com.mysql.jdbc.exceptions.jdbc4.CommunicationsException: Communications link failure 
    The last packet sent successfully to the server was 38382828(대충 28800 * 1000보다 큰 수) milliseconds ago. The driver has not received any packets from the server.
    at sun.reflect.NativeConstructorAccessorImpl.newInstance0(Native Method)
    at sun.reflect.NativeConstructorAccessorImpl.newInstance(NativeConstructorAccessorImpl.java:39)
    at sun.reflect.DelegatingConstructorAccessorImpl.newInstance(DelegatingConstructorAccessorImpl.java:27)
    at java.lang.reflect.Constructor.newInstance(Constructor.java:513)
    at com.mysql.jdbc.Util.handleNewInstance(Util.java:409)
    ...
 ```

이 때 mysql의 wait_timeout은 기본값인 28800초로 되어 있습니다.

해당 에러는 클라이언트의 커넥션이 이미 mysql에서 정리되서 유효하지 않을 때 발생합니다. \
즉, 해당 커넥션은 evictor에 의해 validation 쿼리가 날라가지 않았거나, 삭제되어야 하는 커넥션인데 클라이언트단에서는 유효한 커넥션으로 판단하고 있었는데요

다 정상적으로 동작하는 것 같은데 간헐적으로 알림은 계속 왔습니다. \
여기서 이상한 것은 다음과 같이 time이 누적해서 쌓이고 있는 커넥션들이 어플리케이션 서버마다 없는 경우도 있고, 있는 경우도 있고 개수도 서로 달랐습니다.

위 상황이 로컬에서도 재현이 되었는데요. dbcp2의 evictor 코드 로직을 보아도 코너 케이스가 발생할만한 홀은 없어보였습니다. \
그래서 어플리케이션을 디버그 모드로 실행하여 evict가 발생했을 때 로직을 한 줄씩 따라가며 확인한 결과 원인을 발견할 수 있었습니다. 

예를 들어 다음과 같이 커넥션이 있다고 합시다(lifo), 그리고 커넥션 풀에서는 현재 1 커넥션만 계속 꺼내서 사용된다고 가정합시다.

즉, 커넥션 1이 사용될 때는 2 - 3 - 4 - 5 - 6 - 7 - 8 - 9 - 10 입니다.
그리고 커넥션 1이 반환될 때는 1 - 2 - 3 - 4 - 5 - 6 - 7 - 8 - 9 - 10입니다.

evictor가 가리키는 커넥션이 5이라고 하고, evictor가 깨어날 때는 모두 minEvictableIdleTimeMillis를 보다 커 evict가 발생한다고 합시다. \
이 상황에서는 evictor가 커넥션을 지우면, minIdle을 충족하기 위해 커넥션을 생성합니다. \
즉 다음과 같은 상황이 반복됩니다.

(evict 주기가 되어 evictor가 깨어납니다) \
1 - 2 - 3 - 4 - 5 - 6 - 7 - 8 - 9 - 10, 현재 evictor가 커넥션 5을 바라보고 있으므로 삭제합니다. 그리고 커넥션 6를 바라봅니다. 그리고 새로운 커넥션 11이 생겨 10 뒤에 만들어집니다. \
(evict 주기가 되어 evictor가 깨어납니다) \
1 - 2 - 3 - 4 - 6 - 7 - 8 - 9 - 10 - 11, 현재 evictor가 커넥션 6을 바라보고 있으므로 삭제합니다. 그리고 커넥션 7를 바라봅니다. 그리고 새로운 커넥션 12이 생겨 11 뒤에 만들어집니다. \
(evict 주기가 되어 evictor가 깨어납니다) \
1 - 2 - 3 - 4 - 7 - 8 - 9 - 10 - 11 - 12, 현재 evictor가 커넥션 7을 바라보고 있으므로 삭제합니다. 그리고 커넥션 8를 바라봅니다. 그리고 새로운 커넥션 13이 생겨 12 뒤에 만들어집니다.  \
(반복...)

evictor는 열심히 커넥션을 지우는데도 계속 중간에 있는 커넥션만 삭제합니다. \
그러나 커넥션 1만 커넥션 풀에서 꺼내져서 사용되게 되므로 2, 3, 4 커넥션은 계속 사용되지 않습니다. \
시간이 흘러 mysql은 2, 3, 4 커넥션이 28800초동안 사용되지 않는 것을 보고 커넥션을 mysql에서 지웁니다 

이후 갑자기 트래픽이 몰려와 1 커넥션 이외에도 2, 3, 4 커넥션을 꺼내 클라이언트가 요청을 보내면 이는 mysql가 볼 때는 유효한 커넥션이 아니므로 CommunicationsException 에러가 발생합니다. \
이 문제는 evictor가 깨어났을 때마다 validation 쿼리 대신 커넥션을 지우고 생성하는 과정이 반복되면서 발생하는 것이므로 커넥션 풀의 최소 커넥션 개수에 맞게 numTestsPerEvictionRun, timeBetweenEvictionRunsMillis 값을 설정해야 합니다. \
즉, 커넥션 풀의 커넥션 개수가 minIdle일 때는 커넥션 삭제 대신 validation 쿼리가 나갈 수 있도록, 커넥션 풀에 minIdle + 1 ~ maxTotal 사이로 커넥션 개수가 존재하는 경우에는 적절히 evict되어 다시 minIdle 개수만큼 될 수 있도록 설정해야 되는데 그러지 못해서 이슈가 발생하였습니다.

## 결론
minIdle, maxTotal 값에 맞게 numTestsPerEvictionRun, timeBetweenEvictionRunsMillis 값을 적절히 수정하여 이슈를 해결할 수 있었습니다.


