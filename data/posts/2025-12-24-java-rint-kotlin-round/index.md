---
title: kotlin.math.round(4.5) = kotlin.math.round(3.5) ?, 사사오입과 오사오입(Round half to even)
createdDate: '2025-12-24'
updatedDate: '2025-12-24'
author: cprayer
tags:
  - kotlin
  - IEEE 754
draft: false
---

## TL; DR

* Dobule 타입을 사용할 때 흔히 아는 반올림(사사오입)을 기대하는 경우라면 **roundToInt** / **roundToLong** 메소드를 사용한다 
* 통계적으로 사용되는 경우 오사오입의 오차가 사사오입보다 같거나 더 적기에 더 유리한 방법이라 한다

## 본문

* 최근 정산 어드민을 만드시고 계시는 팀원 분의 PR 코드 리뷰를 진행하던 도중`kotlin.match.round` 메소드를 사용하고 계셨다
* kotlin.math.round(4.5) 처럼 값을 넘기고 있어 이런 경우 동작이 어떻게 되나 궁금하여 찾아보던 도중 round 메소드의 경우 오사오입을 사용한다는 사실을 알게 되었다. 우리가 평소 알던 반올림과는 동작이 다르다
* 우리가 일반적으로 생각하는 반올림은 사사오입이다. 즉 반올림하려고 하는 자리의 값이 5 이상이면 올리고 그 이하면 내린다
* 오사오입의 경우 `Round half to even` 라 하고 반올림하려고 하는 값이 정확히 절반이면 가장 가까운 짝수로 맞추고 그 미만이거나 이상인 경우는 사사오입과 동일하다
  * ex) kotlin.math.round(4.5) = 4이지만 kotlin.math.round(4.50000000000001)은 5이다
  * IEEE 부동소수점 연산 표준(IEEE 754) 에서 Default Rouding Mode가 `Round half to even` 라고 한다
  * 사사오입과 비교했을 때 실제 값들의 합의 평균과 반올림한 값들의 합의 평균이 같거나 더 작다고 한다. 통계에서 분산 / 표준편차도 평균에 기반하여 사용하게 되니 오사오입을 사용하게 되는 것으로 보인다
  * convergent rounding, statistician's rounding, Dutch rounding, Gaussian rounding, odd–even rounding, bankers' rounding 등으로 불린다고 한다
* 우리가 원래 알던 반올림으로 적용하려면 roundToInt / roundToLong 을 사용하면 좋을 것 같다

## 참고 링크
* https://www.reddit.com/r/Kotlin/comments/881f7u/strange_behavior_of_kotlinmathround/?tl=ko
* https://en.wikipedia.org/wiki/IEEE_754
* https://blog.naver.com/noseoul1/221592047071
* https://namu.wiki/w/%EB%B0%98%EC%98%AC%EB%A6%BC
