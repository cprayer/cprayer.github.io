---
title: 확률적 자료구조 종류 및 관련 링크
createdDate: '2018-09-14'
updatedDate: '2018-09-14'
author: cprayer
tags:
  - data-structure
draft: false
---

## 소개

확률적 자료구조인 Bloom filter를 공부하다가, 다른 확률적 자료구조는 어떠한 것이 있는지 궁금했기에 검색을 해봤더니 위키피디아에서 'Probabilistic data structures' 카테고리 페이지를 찾을 수 있었습니다. [[링크]](https://en.wikipedia.org/wiki/Category:Probabilistic_data_structures)

## 확률적 자료구조 리스트

그 중, 한글 자료가 있는 자료구조를 추려 리스트로 만들고 링크를 걸어보았습니다.

### Bloom filter

* 확률적 자료구조를 이용한 추정 - 원소 포함 여부 판단(Membership Query)과 Bloom Filter, 송기선님의 포스트 [[링크]](https://d2.naver.com/helloworld/749531)

### Count-min sketch

* 확률적 자료구조를 이용한 추정 - 빈도(Frequency) 추정을 위한 Count-Min Sketch, 송기선님의 포스트 [[링크]](https://d2.naver.com/helloworld/799782)

### HyperLogLog

* 확률적 자료구조를 이용한 추정 - 유일한 원소 개수(Cardinality) 추정과 HyperLogLog, 송기선님의 포스트 [[링크]](https://d2.naver.com/helloworld/711301)

### Locality-sensitive hashing

* Random Projection and Locality Sensitive Hashing - lovit님의 포스트 [[링크]](https://lovit.github.io/machine%20learning/vector%20indexing/2018/03/28/lsh/#locality-sensitve-hashing)

### MinHash

* MinHash란?, wan2land님의 포스트 [[링크]](http://wani.kr/posts/2016/11/25/minhash/)

### SimHash

* Near Duplicate Documents Detection SimHash 계산 방법, aragorn님의 포스트 [[링크]](https://github.com/aragorn/home/wiki/Near-Duplicate-Documents-Detection#simhash-%EA%B3%84%EC%82%B0-%EB%B0%A9%EB%B2%95)

### Skip List

* Skip List, 김종욱님의 포스트 [[링크]](https://www.slideshare.net/jongwookkim/skip-list)

### Treap

* Treap, namnamseo님의 포스트 [[링크]](http://namnamseo.tistory.com/entry/Treap)

## 그 외 자료

그 이외에도 이러한 자료들을 찾을 수 있었습니다.

* 실시간 추천엔진 머신한대에 구겨넣기, 하용호님 포스트 [[링크]](https://www.slideshare.net/deview/261-52784785)

* 게임 서비스 플랫폼을 지탱하는 알고리즘, 전이삭님 포스트 [[링크]](https://www.slideshare.net/isaacjeon/ss-96910180)

전이삭님의 유튜브 발표 영상도 있어 같이 링크합니다. [[링크]](https://www.youtube.com/watch?v=yoVmf-9fW1c)

## 정리

1. 평균적인 성능(시간복잡도)을 보장할 때 쓰입니다.

2. 정확한 값이 아닌 작은 오차를 가진 근사값이여도 상관이 없을 때 쓰입니다. 대신 저장 공간이나 속도 측면에서 많은 이득을 볼 수 있습니다.