---
title: "nf_conntrack_max 값이 kube-proxy에 의해 /etc/sysctl.conf 값이 아닌 의도하지 않은 값으로 업데이트"
createdDate: '2025-05-18'
updatedDate: '2025-05-18'
author: cprayer
tags:
  - k8s
  - kube-proxy
  - nf-conntrack
draft: false
---

## TL; DR

kube-proxy 가 기동될 때 kernel의 nf_conntrack_max 파라미터 값이 업데이트될 수 있다

## 이슈 원인

전 회사에서 근무 도중 다른 팀에서 간헐적으로 극소수의 요청이 실패하는 경우가 있었으나 APM 상에서는 이슈가 없던 상황이었다 \
원인을 찾던 도중 k8s ingress 노드에서 **nf_conntrack:table full, dropping packet** 와 같은 에러 로그가 발생하는 것을 확인하였다 \
아마 기본적으로 nf_conntrack과 커널 파라미터 등이 튜닝이 되어 있었으나 요청 peak가 몰리는 상황이 발생하여 이슈가 된 것으로 보였다 \
인프라 엔지니어 분께 요청을 드려 관련 ingress 노드들의 nf_conntrack_max 값을 늘려두었다 \
(nf_conntrack와 관련해서는 [네이버 기술 블로그](https://blog.naver.com/n_cloudplatform/221638712887)를 참고하는 것이 좋을 것 같다)

이후 증상이 완화되어 문제가 해결된 줄 알았으나 몇 일이 지난 이후 동일 증상이 발생하는 것을 확인할 수 있었다 \
OS 버전 업데이트 / 하드웨어 이슈 등으로 투입이 제외되었다가 재부팅 이후 다시 투입이 되었던 노드들이었고 nf_conntrack_max 값이 늘려둔 값과는 다른 값으로 설정되어 있었다

/etc/sysctl.conf 쪽에 설정이 누락된 것은 아니였고 실제로 재부팅된 직후에는 nf_conntrack_max 값이 의도한대로 설정되어 있는 것을 확인하였다 \
로그를 좀 더 찾아보니 kube-proxy 쪽에서 아래와 같은 로그를 확인할 수 있었다(당시 실제 로그는 아님)

```
I0322 02:18:07.397120       1 conntrack.go:98] Set sysctl 'net/netfilter/nf_conntrack_max' to 2097120
I0322 02:18:07.397214       1 conntrack.go:52] Setting nf_conntrack_max to 2097120
```

원인을 파악하여 클라우드 엔지니어 분께 관련 설정 변경을 요청드리고 이후에는 **nf_conntrack:table full, dropping packet** 로그가 발생하지 않는 것을 확인할 수 있었다

## 여담

그 외 kube_proxy에 의해 업데이트되는 nf_conntrack 관련 커널 파라미터 값들은 다음 [링크](https://github.com/kubernetes/kubernetes/blob/3196c9946355c1d20086f66c22e9e5364fb0a56f/cmd/kube-proxy/app/conntrack.go#L35-L48)를 참고한다