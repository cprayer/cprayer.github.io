---
title: argocd의 3-way diff 로 인한 이슈
createdDate: '2025-11-09'
updatedDate: '2025-11-09'
author: cprayer
tags:
  - argocd
  - k8s
  - HPA
draft: false
---

최근 Kubernetes 환경에서 ArgoCD와 HPA(Horizontal Pod Autoscaler)를 함께 사용하던 중 프로덕션 환경에서 배포 도중 순간적인 Latency 증가와 요청 실패가 발생하였습니다. 

non-production 환경에서는 간헐적으로 argo sync가 계속 완료되었다는 반복적인 알림이 발생하였습니다. 

원인을 분석해 보니 ArgoCD의 Diff Strategies로 사용 중이었던 3-way-diff 전략(default)의 `last-applied-configuration` 어노테이션에 남아있는 설정으로 이슈가 발생하였습니다.

---

### 현상 및 문제점

#### 1. Production 환경: 배포 도중 Latency 증가 및 요청 일부 실패
프로덕션 환경에서는 HPA가 의도한 최소/최대 Pod 개수 설정(minReplicas, maxReplicas)이 있음에도 불구하고 배포 시 argocd에서 sync가 되면서 ArgoCD가 HPA의 설정값보다 더 적은 개수의 Pod 으로 줄어드는 현상이 발생

결과적으로 배포 도중 적은 수의 Pod이 과도한 트래픽을 처리하게 되어 Latency가 증가하고 요청 실패가 발생하는 현상이 발생한 뒤 HPA에 의해 replica 수가 다시 늘어나면서 자연 해소되었다

#### 2. Non-production 환경: Pod 개수 Flapping (무한 동기화)
`auto-sync`가 활성화된 non-production 환경에서는 아래와 같은 문제가 발생
1.  HPA가 부하에 따라 Pod scale-out / in
2.  ArgoCD는 이 변경을 감지하고 Git이 아닌 `last-applied-configuration`에 남아있는 (잘못된) replica 개수로 되돌리기 위해 auto-sync
3.  다시 HPA가 개입하여 scale-out / in
4.  이 과정이 무한 반복되면서 Pod이 지속적으로 생성되고 삭제되는 'flapping' 현상이 발생

---

### 근본 원인: 3-way-diff와 last-applied-configuration

이 문제의 핵심 원인은 ArgoCD가 동기화 대상을 비교하는 방식에 있다

[Argo CD Diff Strategies 공식 문서](https://argo-cd.readthedocs.io/en/stable/user-guide/diff-strategies)에 따르면 ArgoCD는 리소스의 'Drift'(편차)를 감지하기 위해 여러 Diff 전략을 지원

* Legacy (3-way diff): 기본적으로 사용되는 Diff 전략. Live State(실제 상태), Desired State(Git 상태), 그리고 `last-applied-configuration` 어노테이션을 기반으로 3-way diff를 적용
* Structured-Merge Diff: `Server-Side Apply` 동기화 옵션을 활성화할 때 자동으로 적용되는 전략
* Server-Side Diff: `dry-run` 모드로 Server-Side Apply를 호출하여 예상되는 Live State를 생성하는 새로운 전략

이번 문제는 이 중에서 Legacy (3-way diff) 전략이 argocd default 전략으로 되어 있어 발생했다

3-way diff 방식은 다음과 같이 세 가지 상태를 비교한다

1.  Git (Desired State): GitOps 리포지토리에 정의된 '의도한 상태'
2.  Live State: 현재 k8s 클러스터에 배포된 '실제 상태'
3.  Last Applied Configuration: ArgoCD가 (kubectl apply와 동일한 방식으로) *이전에* 적용했던 내용을 기록해두는 `kubectl.kubernetes.io/last-applied-configuration` 어노테이션

HPA를 사용하게 되면서 git의 deployment manifest(YAML)에서 `.spec.replicas` 필드를 제거했었다. 따라서 argocd의 Desired State에는 .spec.replicas가 없는 것을 기대했으나 과거에 사용했던 `.spec.replicas` 설정이 `last-applied-configuration` 어노테이션 내부에 그대로 남아있었다

ArgoCD는 Legacy 3-way diff 전략에 따라 Git에 `replicas` 설정이 없더라도 `last-applied-configuration`에 `replicas` 값이 남아있으면 이것을 '의도한 상태(Desired State)'로 간주하여 ArgoCD는 Desired State와 Live State가 다르다고 판단했다 (Out-of-Sync)

---

### 해결 방안

이 문제를 해결하기 위해 `last-applied-configuration` 어노테이션을 직접 수정하여 .spec.replicas 설정을 제거했다

혹은 argocd의 ignoreDifferences에 .spec.replicas를 추가하여 관리하거나 3-way diff 이외 다른 diff strategies 를 쓰는 것도 고려할 수 있으나 이로 인해 의도하지 않은 사이드 이펙트가 있는지 확인이 필요하여 위와 같이 조치했다

### 결론

HPA를 도입하게 되면서 ArgoCD의 기본 Diff 전략인 Legacy 3-way diff와 `last-applied-configuration` 어노테이션에 의해 의도치 않은 문제를 겪었다

ArgoCD(`kubectl apply`)가 이 어노테이션을 "Desired State"의 일부로 참고하는 이유는 ArgoCD(사용자)가 관리하는 필드가 다른 주체 에 의해 수정 / 삭제되는 것을 방지하기 위함이고 이 방식은 이슈가 있어 SSA(Server Side Apply)라는 개념이 1.14 버전에 최초로 나왔고 1.22 에 stable 되었다

좀 더 자세하게 알고 싶다면 CSA(Client Side Apply, last-applied-configuration)와 SSA(Server Side Apply, managedFields)에 대해 공부하면 될 것 같다





