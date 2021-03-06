---
title: kubernetes TLS 인증서 secret 생성 및 교체하기
createdDate: '2020-05-03'
updatedDate: '2020-05-03'
author: cprayer
tags:
  - k8s
  - k8s-tls
  - k8s-secret
draft: false
---

## TL; DR

* 아래의 명령어는 kubernetes 1.19 버전에서 진행하였습니다.

* 인증서 생성

```bash
kubectl create secret tls ${secret-tls-name} --key ${tls-key} --cert ${tls-cert} -n ${namespace} --save-config
```

* 인증서 생성(yaml)

```bash
kubectl create secret tls ${secret-tls-name} --key ${tls-key} --cert ${tls-cert} -n ${namespace} --dry-run=client -o yaml > secret.yaml
```

* 인증서 교체

```bash
kubectl create secret tls ${secret-tls-name} --key ${tls-key} --cert ${tls-cert} -n ${namespace} --dry-run=client -o yaml | kubectl apply -f -
```

## 소개

* 쿠버네티스는 클러스터 외부에서 들어오는 L7 트래픽을 처리하기 위해 ingress resource를 사용합니다.
* 이 때, TLS 기능을 사용하는 경우 다음과 같은 형식으로 secret resource를 생성해야 합니다.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: example-secret-tls
data:
  tls.crt: # base64 encoded cert
  tls.key: # base64 encoded key
type: kubernetes.io/tls
```

* 그리고 ingress resource yaml 명세의 .spec.tls[].secretName에 생성한 secret의 이름을 지정해야 합니다.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: example-ingress
spec:
  tls:
  - hosts:
    - example.foo.com
    secretName: example-secret-tls
  rules:
    - host: example.foo.com
      http:
        paths:
        - path: /
          pathType: Prefix
          backend:
            service: 
              name: bar
              port:
               number: 80
```

### 인증서 생성

* 직접 key와 cert를 base64로 인코딩한 후에 secret resource를 생성해도 되지만 번거롭습니다.
* kubectl create secret tls 명령어를 이용하면 손 쉽게 ingress에서 사용할 tls secret을 생성할 수 있습니다.

```bash
kubectl create secret tls ${secret-tls-name} --key ${tls-key} --cert ${tls-cert} -n ${namespace} --save-config`
```

### 인증서 교체

* --dry-run 옵션과 -o yaml 옵션을 이용하여 kubectl create secret tls 명령으로부터 yaml 명세를 얻어낼 수 있고, 해당 yaml을 이용하여 인증서를 교체할 수 있습니다.

```bash
kubectl create secret tls ${secret-tls-name} --key ${tls-key} --cert ${tls-cert} -n ${namespace} --dry-run -o yaml | kubectl apply -f -
```

## 참고

* <https://kubernetes.io/docs/concepts/services-networking/ingress/>
* <https://kubernetes.io/docs/tasks/manage-kubernetes-objects/imperative-command/>
