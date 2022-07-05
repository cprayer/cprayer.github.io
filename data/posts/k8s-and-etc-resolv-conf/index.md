---
title: k8s와 /etc/resolv.conf
createdDate: '2022-07-06'
updatedDate: '2022-07-06'
author: cprayer
tags:
  - domain
  - search-domain
  - absolute-fqdn
  - k8s
draft: false
---

## 요약
k8s는 클러스터 내부에 등록된 도메인 리졸빙을 위해 pod의 /etc/resolve.conf에 search domain 및 ndots값을 변경한다 \
이로 인해 불필요한 질의가 여러 번 발생할 수 있고, 도메인 질의를 많이 하는 어플리케이션이라면 이로 인해 성능 저하를 겪을 수 있다 \
이를 회피하려면 도메인의 마지막에 .(dot)을 붙여 fqdn로 사용하거나 어플리케이션 내 사용하는 도메인 종류를 확인 후 ndots 설정 등을 바꿔야 한다 \
현재 conntrack과 관련해서 udp dns 타이밍 이슈로 패킷이 드랍될 수 있다고 한다


## 본문

pod의 dnsPolicy가 None으로 설정하지 않은 경우 pod의 /etc/resolv.conf를 보면 다음과 같이 설정되어 있는 것을 확인할 수 있다 \
이 글에서는 mac docker desktop 4.3.2의 로컬 k8s 1.22.4를 기준으로 한다

```
nameserver 10.96.0.10
search default.svc.cluster.local svc.cluster.local cluster.local
options ndots:5
```

위 설정으로 인해 질의하는 도메인에 .(dot)이 5개 미만인 경우 search에 설정되어 있는 서치 도메인을 순서대로 모두 접미사에 붙여 성공할 때까지 진행하게 된다 \
예를 들어 pod 내에서 google.com 도메인을 질의하게 된다면
google.com.default.svc.cluster.local -> google.com.svc.cluster.local -> google.com.cluster.local -> google.com 순으로 도메인 질의가 발생한다

이렇게 서치 도메인이 설정되어 있는 이유는 같은 네임스페이스, 혹은 다른 네임스페이스에 있는 서비스를 도메인으로 접근할 때 fqdn이 아니라 짧고 간결한 도메인명으로 접근할 수 있게 함이다 \
k8s에서 어떻게 pod과 service의 도메인명을 등록하는지 관련된 내용은 [해당 링크](https://kubernetes.io/ko/docs/concepts/services-networking/dns-pod-service/)에서 확인할 수 있다

다음은 netshoot pod에서 nslookup -debug google.com를 수행한 결과이다

```
Server:		10.96.0.10
Address:	10.96.0.10#53

------------
    QUESTIONS:
	google.com.default.svc.cluster.local, type = A, class = IN
    ANSWERS:
    AUTHORITY RECORDS:
    ->  cluster.local
	origin = ns.dns.cluster.local
	mail addr = hostmaster.cluster.local
	serial = 1657040299
	refresh = 7200
	retry = 1800
	expire = 86400
	minimum = 30
	ttl = 30
    ADDITIONAL RECORDS:
------------
** server can't find google.com.default.svc.cluster.local: NXDOMAIN
Server:		10.96.0.10
Address:	10.96.0.10#53

------------
    QUESTIONS:
	google.com.svc.cluster.local, type = A, class = IN
    ANSWERS:
    AUTHORITY RECORDS:
    ->  cluster.local
	origin = ns.dns.cluster.local
	mail addr = hostmaster.cluster.local
	serial = 1657040299
	refresh = 7200
	retry = 1800
	expire = 86400
	minimum = 30
	ttl = 30
    ADDITIONAL RECORDS:
------------
** server can't find google.com.svc.cluster.local: NXDOMAIN
Server:		10.96.0.10
Address:	10.96.0.10#53

------------
    QUESTIONS:
	google.com.cluster.local, type = A, class = IN
    ANSWERS:
    AUTHORITY RECORDS:
    ->  cluster.local
	origin = ns.dns.cluster.local
	mail addr = hostmaster.cluster.local
	serial = 1657040299
	refresh = 7200
	retry = 1800
	expire = 86400
	minimum = 30
	ttl = 30
    ADDITIONAL RECORDS:
------------
** server can't find google.com.cluster.local: NXDOMAIN
Server:		10.96.0.10
Address:	10.96.0.10#53

------------
    QUESTIONS:
	google.com, type = A, class = IN
    ANSWERS:
    ->  google.com
	internet address = 142.250.76.142
	ttl = 30
    AUTHORITY RECORDS:
    ADDITIONAL RECORDS:
------------
Non-authoritative answer:
Name:	google.com
Address: 142.250.76.142
------------
    QUESTIONS:
	google.com, type = AAAA, class = IN
    ANSWERS:
    ->  google.com
	has AAAA address 2404:6800:400a:80e::200e
	ttl = 30
    AUTHORITY RECORDS:
    ADDITIONAL RECORDS:
------------
Name:	google.com
Address: 2404:6800:400a:80e::200e
```
사실 google.com의 경우 클러스터 내부의 서비스나 pod과는 무관하기에 서치 도메인과는 아무런 관련이 없다 \
이런 케이스의 경우 불필요한 질의가 발생하지 않게 하려면 도메인의 끝에 .을 붙여 fdqn로 강제하면 된다 \
다음은 nslookup -debug google.com.을 수행한 결과이다
```
Server:		10.96.0.10
Address:	10.96.0.10#53

------------
    QUESTIONS:
	google.com, type = A, class = IN
    ANSWERS:
    ->  google.com
	internet address = 142.250.76.142
	ttl = 30
    AUTHORITY RECORDS:
    ADDITIONAL RECORDS:
------------
Non-authoritative answer:
Name:	google.com
Address: 142.250.76.142
------------
    QUESTIONS:
	google.com, type = AAAA, class = IN
    ANSWERS:
    ->  google.com
	has AAAA address 2404:6800:400a:80e::200e
	ttl = 30
    AUTHORITY RECORDS:
    ADDITIONAL RECORDS:
------------
Name:	google.com
Address: 2404:6800:400a:80e::200e
```

혹은 pod 내에서 질의하는 도메인 종류 등을 확인하여 ndots 설정을 변경하면 된다 \
다음은 ndots: 5에서 nslookup -debug google.com.com.com.com.com와 같이 도메인 내 .(dot)이 5개 포함되어 있는 경우를 질의한 결과를 보여준다

```
Server:		10.96.0.10
Address:	10.96.0.10#53

------------
    QUESTIONS:
	google.com.com.com.com.com, type = A, class = IN
    ANSWERS:
    ->  google.com.com.com.com.com
	internet address = 199.59.243.200
	ttl = 30
    AUTHORITY RECORDS:
    ADDITIONAL RECORDS:
------------
Non-authoritative answer:
Name:	google.com.com.com.com.com
Address: 199.59.243.200
------------
    QUESTIONS:
	google.com.com.com.com.com, type = AAAA, class = IN
    ANSWERS:
    AUTHORITY RECORDS:
    ADDITIONAL RECORDS:
------------
```

따라서 pod 내에서 사용하는 모든 도메인을 파악하여 적절히 ndots 설정을 하면 불필요한 도메인 질의를 줄일 수 있다 \
다만 이 경우에는 ndots 설정 변경으로 인해 서치 도메인을 접미사로 붙여 질의해야 하는 클러스터 내부용 도메인을 놓쳐 정상적으로 도메인 리졸빙이 안되는 케이스가 발생할 수 있으므로 주의해야 한다

# 여담

conntrack과 관련해서 udp를 사용하는 dns 질의는 타이밍 이슈로 간헐적 패킷이 드랍되는 이슈가 있다 ([관련 링크](https://www.weave.works/blog/racy-conntrack-and-dns-lookup-timeouts)) \
NodeLocal DNSCache 등을 사용하면 증상을 완화시킬 수 있다고 한다 ([관련 링크](https://kubernetes.io/docs/tasks/administer-cluster/nodelocaldns/))
 
