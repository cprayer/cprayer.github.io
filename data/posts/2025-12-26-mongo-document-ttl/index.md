---
title: mongo document 가 동시에 대량 ttl expired 될 때 동작
createdDate: '2025-12-26'
updatedDate: '2025-12-26'
author: cprayer
tags:
  - mongo
draft: false
---

* mongo에서는 [TTL index](https://www.mongodb.com/docs/manual/core/index-ttl/#std-label-index-feature-ttl) 를 통해 document 를 특정 시간 이후 자동으로 삭제할 수 있다
* 만약에 동시에 엄청 많은 document가 만료되는 경우가 발생하면 서비스에 영향이 있지 않을까? 라는 이야기가 팀 내에 있어서 팀원 분이 [관련 공식 문서 관련 내용](right://www.mongodb.com/docs/manual/core/index-ttl/#std-label-index-feature-ttl)을 알려주셨고 내용은 대략적으로 아래와 같다
* TTL 제거 백그라운드 작업은 60초마다 실행됨(싱글 쓰레드)
* 현재 생성되어 있는 TTL index마다 삭제를 반복함. 아래 조건 중 하나라도 만족하게 되는 경우 현재 index에서는 지우는 작업을 멈추고 다음 TTL index로 넘어가게 됨
  1. 현재 TTL index에서 50,000 개의 document 를 지운 경우
  2. 현재 TTL index에서 삭제 작업이 1초 이상 소요된 경우
  3. 현재 TTL index에서 지울 수 있는 모든 document를 지운 경우
* 만약 위 작업(sub-pass)이 60초 이상 걸리면 종료하고 다시 시작
* Replica Set 에서는 Primary 에 해당하는 document만 삭제하게 됨. (이후 replica 로 삭제 operation이 복제되어 처리됨)

## P.S
* 대부분의 경우에는 delete 연산 부하로 인한 성능 이슈는 발생하지 않을 것으로 보이긴 하나 여러 개의 TTL index로 인해 동시에 발생하고 50,000개씩 지워지는 상황이라면 영향을 줄 수 있을 것으로 보인다
* 지워지지 않은 document의 경우 쿼리에서 조회될 수 있다. 이미 만료된 document가 쿼리 결과에 포함되면 안되는 경우에는 해당 필드를 명시적으로 쿼리에 포함시켜야 한다
* 처음에는 mongo 쪽에서 알아서 묵시적으로 필터링해서 내려주면 되지 않나 싶었는데 여러 개의 TTL index가 있을 수도 있고 모든 find / aggregate 등의 명령을 수행할 때 expire 여부를 판단하는 것도 비용이 상당할 수 있어 필요한 경우에만 명시적으로 지정하도록 하도록 만든 것으로 보인다
