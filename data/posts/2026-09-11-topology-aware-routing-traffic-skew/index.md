---
title: "Topology Aware Routing 으로 인해 일부 pod 에만 트래픽이 몰린 이슈"
createdDate: '2026-09-11'
updatedDate: '2026-09-11'
author: cprayer
tags:
  - k8s
  - topology-aware-routing
  - troubleshooting
draft: false
---

## TL; DR

Topology Aware Routing 은 zone 별 노드의 allocatable CPU 비율로 forZones 힌트를 계산한다 \
pod 가 zone 에 고르게 배치되지 않은 상태에서 힌트가 붙으면 쏠림(skew)이 발생할 수 있고 pod 개수 자체가 적을수록 심해진다 \
zone 별로 pod 개수를 맞추려면 `topologySpreadConstraints` 를 함께 설정해야 한다

## 증상 및 원인 파악

여러 서비스가 공통으로 호출하는 피처 플래그 서버에서 타임아웃이 발생하며 HTTP 503 status 응답이 내려오기 시작했고 플래그를 조회하던 서비스들의 응답이 느려지면서 게이트웨이에서도 타임아웃이 발생하며 HTTP 504 status 응답이 내려왔다 \
피처 플래그 서버 pod 에는 인바운드 요청을 받아 동시 요청 최대 처리량을 제한하는 사이드카 프록시가 있는데 상한을 넘은 요청이 admission 큐에 쌓이면서 타임아웃으로 이어진 것이었다 \
큐에 밀린 요청이 업스트림에 쌓이자 ingress 쪽 circuit breaker 도 걸려 접근 로그에 Upstream Overflow 를 의미하는 `response_flags: UO` 가 대량으로 찍혔다 \
플래그 조회가 동기 블로킹 HTTP 호출이라 응답이 늦어지자 스레드가 잡힌 채 hang 되면서 헬스체크까지 실패해 pod 기동이 되지 않는 서비스도 있었다

조회에 실패했을 때 쓸 폴백은 있었지만 결과를 캐시하지는 않아 요청마다 서버를 찔렀고 폴백도 타임아웃까지 기다린 뒤에야 동작한다

그렇다고 전체 pod 의 트래픽이 균등하게 몰린 것도 아니었다 \
pod 4개는 전부 같은 zone 에 떠 있었는데 그중 2개만 상한에 닿았고 나머지 2개로는 요청이 거의 들어오지 않았다

---

## forZones 힌트와 유입 트래픽의 기준 불일치

클러스터에는 [Topology Aware Routing](https://kubernetes.io/docs/concepts/services-networking/topology-aware-routing/) 이 켜져 있었다 \
zone 을 넘는 트래픽을 줄여 전송 비용과 latency 를 낮추려는 기능이다 \
거치는 구간이 줄고 RTT 가 짧아지는 만큼 throughput 도 올라간다 \
zone 사이를 오가는 구간 자체가 없어지므로 그 구간에서 생기는 장애나 지연의 영향도 받지 않게 되어 공식 문서는 가용성도 이점으로 든다 \
EndpointSlice 의 각 endpoint 에 `forZones` 힌트를 넣어 호출자와 같은 zone 의 endpoint 로만 트래픽을 보내는 식으로 동작하고 힌트는 그 Service 의 pod 가 아니라 클러스터 전체 노드의 allocatable CPU 를 zone 별로 합산한 비율로 계산된다 \
다만 이 방식은 유입 트래픽이 zone 별 노드 용량에 비례한다는 전제를 두고 있어서 트래픽이 일부 zone 에서만 들어오면 맞지 않는다고 문서에 적혀 있다

트래픽은 ingress 프록시를 거쳐 들어왔는데 이 프록시는 전부 ap-northeast-2a 에 떠 있었고 피처 플래그 서버 pod 4개는 전부 ap-northeast-2c 에 있었다 \
힌트 입장에서 호출자는 원래의 서비스가 아니라 바로 앞단의 이 프록시다

힌트는 pod 가 실제로 어디 있는지와 무관하게 zone 별 CPU 비율만큼 배분된다 \
2a 몫을 채울 pod 가 2a 에 없으니 2c 에 있는 pod 에서 빌려와 2개에 `forZones: ap-northeast-2a` 를 붙이고 나머지 2개에는 `ap-northeast-2c` 를 붙였다 \
클라이언트는 전부 2a 에 있었으므로 2c 로 지정된 2개는 아무도 부를 수 없는 endpoint 가 됐고 쓸 수 있는 용량이 절반으로 줄었다

클라이언트가 특정 zone 에 편향된 만큼 skew 가 생기는 구조인데 이 경우는 전부 한 zone 에 있어서 편향이 최대인 상태였다 \
pod 수가 적을수록 한 쪽으로 지정되는 endpoint 비중이 커져 skew 의 영향을 더 크게 받는다

장애 직전 `TopologyAwareHintsEnabled` 이벤트가 발생했고 그 직후부터 트래픽이 2개 pod 로 몰린 것을 접근 로그에서 확인할 수 있었다 \
이벤트를 2주치 훑어보니 이 Service 는 `TopologyAwareHintsEnabled` 와 `TopologyAwareHintsDisabled` 사이를 하루에 한두 번씩 계속 오가고 있었고 Disabled 사유는 전부 같았다

```
TopologyAwareHintsDisabled: Unable to allocate minimum required endpoints
to each zone without exceeding overload threshold (4 endpoints, 2 zones)
```

이 전환은 EndpointSlice controller 가 슬라이스를 조정할 때마다 [AddHints](https://github.com/kubernetes/kubernetes/blob/9323f719f432dfd37ed0ec4d0d4aa4f1b606bfcb/staging/src/k8s.io/endpointslice/topologycache/topologycache.go#L90-L170) 에서 매번 다시 판정한다 \
ready 상태인 endpoint 수와 zone 별 노드의 allocatable CPU 비율을 입력으로 zone 마다 최소 할당량을 계산하고 아래 중 하나라도 걸리면 힌트를 붙이지 않고 이미 붙어 있던 힌트까지 제거하면서 `TopologyAwareHintsDisabled` 이벤트를 남긴다

* 노드의 zone 정보나 allocatable CPU 를 알 수 없음
* ready 노드가 한 zone 에만 있음
* zone 수보다 ready endpoint 수가 적음
* zone 별 최소 할당량의 합이 전체 endpoint 수를 넘음

힌트는 마지막 조건에 걸려 제거되고 있었다 \
zone 의 몫은 `zone 별 CPU 비율 * 전체 endpoint 수` 이고 그 zone 이 최소한 확보해야 하는 endpoint 수는 `ceil(몫 / 1.2)` 로 계산한다 \
1.2 는 endpoint 하나가 제 몫보다 20% 까지는 더 받아도 된다는 overload 임계값 0.2 에서 나온 값으로 상수로 박혀 있다

endpoint 4 개에 zone 2 개인 경우로 넣어보면 이렇게 된다

* 비율이 0.5 / 0.5 면 몫이 각각 2 이고 최소값은 `ceil(2 / 1.2)` 로 2 씩이라 합이 4 로 딱 맞는다
* 0.65 / 0.35 면 몫이 2.6 과 1.4 인데 최소값은 `ceil(2.17)` 로 3, `ceil(1.17)` 로 2 가 되어 합이 5 다

가진 endpoint 는 4 개뿐이라 두 zone 의 최소값을 동시에 맞출 방법이 없고 이때 힌트가 제거된다 \
endpoint 수가 적으면 올림이 두 zone 양쪽에서 크게 작용해서 이 조건에 쉽게 걸린다

비율이 틀어질수록 제거되는 것은 아니고 붙는 구간과 제거되는 구간이 번갈아 나온다 \
큰 쪽 비율을 기준으로 보면 0.6 까지는 붙고 0.6 과 0.7 사이에서 제거됐다가 0.7 부터 0.9 까지는 다시 붙는다 \
한쪽 몫이 1 이하로 내려가면 그 zone 의 최소값이 1 로 떨어져 합이 다시 맞아떨어지기 때문이고 그래서 비율이 경계를 오르내리기만 해도 힌트가 켜졌다 꺼졌다 한다

할당에 성공했는데 직전까지 힌트가 없던 상태였다면 `TopologyAwareHintsEnabled` 이벤트를 남기고 힌트를 붙인다 \
이벤트 메시지의 endpoint 수 4 와 zone 수 2 는 2주 내내 그대로였으니 판정을 뒤집은 것은 zone 별 CPU 비율뿐이다 \
클러스터의 노드 구성이 바뀌어 zone 별 CPU 비율이 조금만 움직여도 힌트가 붙었다 떨어졌다 하는 상태였고 붙는 순간 skew 가 생긴다 \
그 2개 pod 의 사이드카만 먼저 상한에 닿았고 나머지 pod 가 놀고 있는데도 신규 요청이 큐에 밀리면서 지연이 발생했다

힌트가 붙었다 떨어졌다 한 것은 2주 내내 반복됐는데 그동안은 아무 일도 없었다 \
마지막 플립 때만 장애가 된 것은 플래그 값을 서버 푸시(SSE)로 내려주는 방식이 들어가면서 커넥션이 길게 유지돼 동시에 처리 중인 요청 수가 이미 상한에 거의 근접해 있었기 때문이다 \
SSE 를 붙일 때 사이드카 프록시의 최대 동시 처리 요청 수 제한을 놓친 것으로 보인다 \
사이드카가 제한하는 것은 초당 처리량이 아니라 동시 처리 수라 호출이 몰리지 않아도 커넥션이 오래 잡혀 있으면 상한에 가까워지고 거기에 skew 가 겹치면서 상한을 넘겼다

관련 클러스터에 롤백 등의 배포가 일어나면서 힌트 배분이 다시 되고 나서야 풀렸다

## 후속 조치

SRE 분이 해당 Service 에 한해 Topology Aware Routing 을 껐다

호출 쪽은 SDK 가 기본값으로 내부 운영 트래픽용 주소를 바라보게 되어 있어 실서비스 트래픽이 그대로 그쪽으로 들어가고 있었다 \
호출 주소를 실서비스용으로 바꾸고 동기 블로킹 호출을 쓰던 SDK 를 논블로킹 버전으로 올리면서 플래그 평가 타임아웃을 줄이고 로컬 캐시를 넣었다

## 남은 것

Topology Aware Routing 을 끈 것은 이 Service 하나라 같은 조건에 놓인 다른 Service 는 그대로 남아 있다 \
다만 내부 운영용으로 쓰는 클러스터라 그 자체로 큰 문제가 되지는 않을 것으로 보이고 이번처럼 실서비스 트래픽이 잘못 들어오는 경우를 대비하는 쪽에 가깝다

호출 주소를 바꾼 것은 내부 운영용 서버가 실서비스 트래픽을 받지 않게 한 것이지 skew 자체를 없애는 조치는 아니었다

사이드카 쪽도 admission 큐에서 무한정 기다리게 두지 말았어야 했다 \
큐 대기에 짧은 타임아웃을 걸거나 일정 개수 이상 쌓이면 요청을 바로 버리고 실패로 응답했다면 호출자가 스레드를 잡은 채 기다리다 헬스체크까지 실패하는 데까지는 가지 않았을 것 같다

## 여담

`service.kubernetes.io/topology-mode` 어노테이션 방식은 [KEP-4444](https://github.com/kubernetes/enhancements/tree/master/keps/sig-network/4444-service-traffic-distribution) 에서 `spec.trafficDistribution` 필드로 대체하기로 되어 있다 \
둘 다 설정하면 아직은 어노테이션이 우선하지만 어노테이션은 이후 릴리즈에서 제거될 예정이다

KEP 가 적어둔 이유가 이번에 겪은 것과 같다 \
`Auto` 값 하나만 두고 구현체가 알아서 판단하게 한 설계라 사용자 입장에서 예측하기 어렵고 힌트가 적용되지 않거나 기대대로 동작하지 않는다는 이슈가 있었다는 것이다 \
그래서 `PreferSameZone` 이나 `PreferSameNode` 처럼 선호를 직접 지정하는 방식으로 바뀐다

새 필드의 값 정의에는 클라이언트와 endpoint 분포를 확인하고 쓰지 않으면 endpoint 가 과부하될 수 있다는 주의가 주석으로 달려 있다
