---
title: hbase shared client 1.2 dns 과다 질의 이슈
createdDate: '2022-07-02'
updatedDate: '2022-07-02'
author: cprayer
tags:
  - hbase
  - hbase-sharded-client
  - troubleshooting
draft: false
---

## 요약

hbase sharded client 1.2에는 hbase.resolve.hostnames.on.failure 옵션이 있다 \
동일 호스트명에 ip가 바뀌어 리전 서버가 투입되는 경우가 없다면 false로 하여 불필요한 dns 질의를 없애자

## 본문

사내에서 제공해주는 hbase 1.2 및 어플리케이션은 hbase sharded client 1.2를 쓰는데, 이전부터 인프라 부서에서 dns 질의가 많다고 연락이 오는 상황이었다 \
확인해보니 관련된 어플리케이션 서버들이 특정 도메인으로 모두 합쳐 초당 10만건 가량 도메인 질의를 발생시키고 있었다 \
왜 이렇게 도메인 질의가 많이 발생한걸까?

이것저것 삽질을 해보니 원인을 파악할 수 있었다 \
원인은 hbase shareded client 1.1부터 들어간 코드였다([HBASE-13067](https://issues.apache.org/jira/browse/HBASE-13067)) \
리전 서버가 hbase 클러스터에서 하드웨어 이슈로 잠시 제외되었다가 동일 호스트명에 ip가 바뀌어서 투입되면 바뀐 ip를 인지하지 못해 stub key를 구할 때 dns 질의를 하도록 코드가 변경되었다 \
따라서 hbase로 매 요청을 날릴 때마다 요청에 맞는 리전 서버의 스텁을 찾기 위해 stub key를 구하고 이 때마다 dns 질의가 발생했던 것이다 \
1.2에서는 동일 호스트명에 ip가 바뀌는 케이스가 없는 경우에는 불필요한 질의를 막기 위해 hbase.resolve.hostnames.on.failure 옵션을 추가하였다([HBASE-14544](https://issues.apache.org/jira/browse/HBASE-14544))

아래는 1.2.12 버전의 org.apache.hadoop.hbase.client.ConnectionManager.HConnectionImplementation 클래스 내 getStubkey 메소드다

```java
static String getStubKey(final String serviceName,
                             final String rsHostname,
                             int port,
                             boolean resolveHostnames) {

      // Sometimes, servers go down and they come back up with the same hostname but a different
      // IP address. Force a resolution of the rsHostname by trying to instantiate an
      // InetSocketAddress, and this way we will rightfully get a new stubKey.
      // Also, include the hostname in the key so as to take care of those cases where the
      // DNS name is different but IP address remains the same.
      String address = rsHostname;
      if (resolveHostnames) {
        InetAddress i =  new InetSocketAddress(rsHostname, port).getAddress();
        if (i != null) {
          address = i.getHostAddress() + "-" + rsHostname;
        }
      }
      return serviceName + "@" + address + ":" + port;
    }
```

하둡 부서에서 리전 서버를 동일 호스트명에 ip를 바꿔 투입하는 경우가 있는지 확인하고, 없는 것을 확인 뒤 hbase.resolve.hostnames.on.failure 옵션을 false로 하는 것을 통해 초당 10만건이 발생하던 쿼리를 초당 몇건 수준으로 내릴 수 있었다

보통의 경우라면 자바 어플리케이션 단에서 networkaddress.cache.ttl 값을 통해 dns cache를 하거나 혹은 os 단에서 dns cache를 하는 경우가 있다

그런데 왜 dns 쿼리가 이리 많이 발생했을까? \
사내 환경에서는 MHA(mysql high availability)나 RHA(redis high availability)라고 하여 도메인을 기반으로 한 페일 오버를 하고 있다 \
해당 모듈은 RHA를 사용하고 있어 networkaddress.cache.ttl 값을 0으로 사용하고 있고 os 단에서도 별도 dns cache를 사용하고 있지 않아 사내 도메인 서버로 요청이 과다하게 들어가게 됐다

## 여담

[HBASE-25292](https://issues.apache.org/jira/browse/HBASE-25292)에서는 도메인 질의 관련 InetSocketAddress 로직 개선이 이루어졌다 \
따라서 1.7, 2.5, 3.0와 이후 버전 클라이언트는 위와 같은 dns 과다 질의 이슈가 발생하지 않을 것으로 보인다 \
다만 현재 사용하고 있는 hbase 버전이 1.2이었고, 사내에서 1.6 클라이언트와 1.2 hbase를 사용할 때 메타 정보 관련 이슈가 있어 정상적으로 사용하지 못하는 상황으로 알고 있어 클라이언트 버전을 올리는 것은 고려하지 않았다 \
hbase 버전을 올리는 것은 많은 작업을 동반하기에 먼저 옵션을 건드는 방향으로 접근하였다