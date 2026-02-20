---
title: redis 정리
createdDate: '2026-02-21'
updatedDate: '2025-02-21'
author: cprayer
tags:
  - redis
draft: false
---

* redis는 epoll, kqueue 와 같은 I/O 멀티 플렉싱을 통해 이벤트 루프 기반의 싱글 쓰레드로 동작하고 다양한 자료구조(string, set, zset, pubsub, hyperloglog, etc)를 제공한다
  * 명령어는 싱글 쓰레드에서 원자적으로 처리되고 redis 6 이후부터 network read/write I/O에 한해 멀티 쓰레드로 처리한다
  * 이로 인해 `KEYS *` 처럼 O(N) 명령이 오래 걸리면 후속으로 이어지는 모든 명령을 blocking 할 수 있으므로 주의해야 한다
* RDB / AOF를 통해 disk 기반으로 데이터를 저장해두면 redis 서버가 예기치 못하게 종료되어도 데이터 복구가 가능하다
  * 스냅샷 이후나 아직 기록되지 않은 명령어 등으로 인해 직전 데이터 유실은 발생할 수 있다
  * RDB / AOF를 모두 끄더라도 primary-replica 구조이고 full sync 발생 시 background RDB snapshot을 생성하여 replica에 전송한다
* redis는 MULTI / EXEC 명령을 통해 여러 명령어를 트랜잭션으로 묶어 원자적으로 처리 가능하다
  * EXEC 명령을 수행하면 MULTI 이후 큐에 큐잉된 명령어가 모두 수행되고 이 명령어들은 하나의 트랜잭션 단위로 묶어 수행된다.
  * 다른 클라이언트가 명령을 사이에 보내더라도 `MULTI` - `EXEC`에서 큐잉된 명령어는 하나의 단위로 처리된다. `KEYS *` 와 동일하게 트랜잭션 내에 오래 걸리는 명령어가 포함되어 있으면 다른 클라이언트에서 보낸 명령어들도 같이 지연이 발생할 수 있다
  * 데이터베이스처럼 REPEATABLE READ 등과 같은 기능은 제공하지 않고 rollback을 지원하지 않는다. runtime error가 발생하는 경우 해당 명령만 실패하고 이전 명령은 유지된다
* lua script의 경우에도 원자적으로 수행되어 오래 걸리도록 작성하면 안된다
* Spring Data에서 Transactional 어노테이션을 사용하더라도 레디스 명령과 관련된 부분은 트랜잭션 동작을 하지 않는다
  * 사용이 필요한 경우 RedisTemplate에 명시적으로 setEnableTransactionSupport(true) 호출하여 설정해야 한다
  * 또한 mysql과 mongo 등에서 사용하는 트랜잭션과는 무관하게 트랜잭션이 동작된다
* 자동 failover를 위해 redis sentinel이나 redis cluster 를 사용할 수 있다
* redis Cluster는 16384개의 hash slot 기반으로 샤딩을 제공하여 어플리케이션 레벨에서 별도의 consistent hashing과 같은 샤딩을 구현하지 않아도 된다
