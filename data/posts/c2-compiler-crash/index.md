---
title: eclipse-temurin 17.0.8.1 에서 C2 Compiler crash(SIGSEGV) 발생
createdDate: '2025-11-15'
updatedDate: '2025-11-15'
author: cprayer
tags:
  - openjdk
  - eclipse-temurin
  - C2 Compiler
  - JIT
draft: false
---

eclipse-temurin 17.0.8.1 사용 시 간헐적으로 아래와 같은 JVM SIGSEGV Crash 로그와 함께 어플리케이션이 종료되면서 continer가 재기동되었다

이슈가 해결된 버전(ex. 17.0.15_6) 으로 업그레이드 하면 발생하지 않는다([관련 티켓](https://bugs.openjdk.org/browse/JDK-8303279]))

관련 openjdk 버전 및 kotlin 버전을 사용하면 발생하는 이슈인걸로 보인다

```
#
# A fatal error has been detected by the Java Runtime Environment:
#
#  SIGSEGV (0xb) at pc=0x0000000000000000, pid=9, tid=17
#
# JRE version: OpenJDK Runtime Environment Temurin-17.0.8.1+1 (17.0.8.1+1) (build 17.0.8.1+1)
# Java VM: OpenJDK 64-Bit Server VM Temurin-17.0.8.1+1 (17.0.8.1+1, mixed mode, sharing, tiered, compressed oops, compressed class ptrs, serial gc, linux-amd64)
# Problematic frame:
# V  [libjvm.so+0xdf1878]  SubTypeCheckNode::sub(Type const*, Type const*) const+0x2c8
#
# Core dump will be written. Default location: /app/core.9
#
# An error report file with more information is saved as:
# /app/hs_err_pid9.log
#
# Compiler replay data is saved as:
# /app/replay_pid9.log
#
# If you would like to submit a bug report, please visit:
#   https://github.com/adoptium/adoptium-support/issues
#
Aborted (core dumped)
```

### 여담

해당 이슈를 찾을 때 Gemini Deep Research를 썼는데 원인 분석 및 관련 github PR / openjdk ticket 을 잘 찾아줘서 요긴하게 사용하였다

최근에 크롬 브라우저 환경에서 어드민 페이지에서 Prime Icons 렌더링 이슈가 있었는데 알고 보니 크로미움 관련 리그레션 버그인 것도 Deep Research 를 통해 알게 되었다

JIT C2 Compiler 관련이라 이전에 보았던 JVM warm up ifkakao [영상](https://www.youtube.com/watch?v=CQi3SS2YspY) 도 오랜만에 다시 보게 되었다


