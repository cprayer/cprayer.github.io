---
title: "dumb-init 이 손자 프로세스를 기다리지 않아 graceful shutdown 이 동작하지 않던 이슈"
createdDate: '2026-09-22'
updatedDate: '2026-09-22'
author: cprayer
aiGenerated: true
tags:
  - k8s
  - docker
  - dumb-init
  - graceful-shutdown
  - troubleshooting
draft: false
---

## TL; DR

dumb-init 을 PID 1 로 두어도 `CMD` 를 shell form 으로 쓰면 앱은 dumb-init 의 직접 자식인 sh 의 자식으로 실행된다 \
SIGTERM 은 프로세스 그룹 전송이라 앱까지 도달하지만 sh 는 SIGTERM 을 받자마자 바로 종료되고 dumb-init 은 모든 자식의 종료를 기다리는 것이 아니라 자신의 자식만 고려하고 손자는 고려하지 않아 그대로 exit 하면서 앱은 종료 훅을 시작하기도 전에 SIGKILL 된다 \
`CMD` 의 실행 명령 앞에 `exec` 를 붙이면 앱이 dumb-init 의 자식이 되도록 설정할 수 있다

## dumb-init 을 쓰는 이유

Dockerfile 을 아래처럼 쓰면 종료 신호가 앱까지 전달되지 않는다

```dockerfile
FROM eclipse-temurin:21-jre

COPY build/libs/app.jar /app/app.jar

ENTRYPOINT java -jar /app/app.jar
```

shell form 으로 쓰면 Docker 가 `/bin/sh -c` 로 감싸기 때문에 sh 가 PID 1 이 된다 \
컨테이너의 PID 1 은 PID namespace 의 init 이라 핸들러를 등록하지 않은 시그널은 커널이 전달하지 않으므로 sh 는 SIGTERM 을 받고도 그대로 살아 있고 자식에게 전달하지도 않는다 \
앱은 아무 신호도 못 받은 채 유예시간이 만료될 때까지 살아 있다가 예외인 SIGKILL 로 죽는다

그래서 PID 1 자리에 dumb-init 을 두고 신호 전달을 맡긴다

```dockerfile
FROM eclipse-temurin:21-jre

RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

COPY build/libs/app.jar /app/app.jar

ENTRYPOINT ["/bin/dumb-init", "--"]
CMD java -jar /app/app.jar
```

## CMD 를 shell form 으로 쓰면 앱이 sh 의 자식으로 실행된다

`ENTRYPOINT` 를 배열로 바꿔도 `CMD` 가 shell form 이면 `CMD` 쪽이 `/bin/sh -c` 로 감싸진다

```
PID 1  /bin/dumb-init -- /bin/sh -c java -jar /app/app.jar
PID 7  /bin/sh -c java -jar /app/app.jar
PID 9  java -jar /app/app.jar
```

3초짜리 종료 훅을 가진 테스트 jar 로 `docker stop -t 30` 을 실행해봤다

| 구조 | 프로세스 트리 | stop | 종료 훅 |
|---|---|---|---|
| `CMD java …` | java(9)가 sh(7)의 자식, sh(7)가 dumb-init(1)의 자식 | 165ms | 시작도 못 함 |
| `CMD exec java …` | java(7)가 dumb-init(1)의 직접 자식 | 3174ms | 모두 실행 |

종료 코드는 둘 다 143 이라 밖에서 보면 똑같이 정상적인 SIGTERM 종료로 보인다

## 시그널은 앱까지 도달한다

신호가 앱에 전달되지 않은 것이라면 dumb-init 이 없을 때처럼 유예시간 만료까지 기다리다 SIGKILL 로 끝났어야 한다 \
165ms 에 143 으로 끝났으니 전달은 됐고 앱이 종료 절차를 밟지 못한 것이다

dumb-init 은 기본 모드에서 자식을 새 세션으로 띄우고 신호를 프로세스 그룹 전체에 보낸다 \
[소스](https://github.com/Yelp/dumb-init/blob/v1.2.5/dumb-init.c#L47-L66) 에서 `use_setsid` 기본값이 1 이라 `kill()` 에 음수 pid 를 넘긴다. `kill()` 에 음수 pid 를 넘기면 절댓값이 프로세스 그룹 ID 로 해석되어 해당 그룹의 모든 프로세스에 시그널이 전달된다

```c
char use_setsid = 1;                                    // L47

void forward_signal(int signum) {
    kill(use_setsid ? -child_pid : child_pid, signum);  // L66
}
```

sh 가 중계하는 것이 아니라 dumb-init 이 그룹 전체에 직접 전달하는 것이라 중간에 sh 가 끼어 있어도 손자인 앱까지 간다

## 그런데 왜 종료 훅이 안 도는가

[SIGCHLD 처리](https://github.com/Yelp/dumb-init/blob/v1.2.5/dumb-init.c#L99-L116) 를 보면 자신의 자식이 종료되는 순간 남은 자식들에게 SIGTERM 을 한 번 더 보내고 기다리지 않고 종료한다

```c
} else if (signum == SIGCHLD) {                          // L99
    while ((killed_pid = waitpid(-1, &status, WNOHANG)) > 0) {
        if (killed_pid == child_pid) {                   // L112  자신의 자식만 본다
            forward_signal(SIGTERM);                     // L113
            exit(exit_status);                           // L115  기다리지 않는다
        }
    }
}
```

`WNOHANG` 이라 이미 종료된 자식을 회수할 뿐 살아 있는 프로세스를 기다리지는 않고 종료 판단도 `child_pid` 하나만 본다 \
손자는 dumb-init 이 아니라 sh 의 자식이라 애초에 대상이 아니다

여기에 sh 가 SIGTERM 을 받자마자 바로 종료된다는 조건이 겹친다 \
3단 구조의 sh 는 PID 1 이 아니라서 핸들러 없는 시그널의 기본 동작인 종료가 그대로 적용된다 \
sh 가 종료되면 dumb-init 이 자신의 자식이 종료된 것을 감지해 `exit()` 하고 PID 1 이 사라지면서 컨테이너가 정리된다 \
앱은 SIGTERM 을 받았지만 JVM 이 훅 스레드를 띄우는 수십 ms 사이에 이미 컨테이너가 없어진 뒤다

두 조건을 하나씩 떼어내 확인했다

* 중간 sh 에만 `trap 'sleep 10; exit 0' TERM` 을 걸고 앱에는 아무것도 전달하지 않았더니 stop 이 10311ms 걸리고 앱이 SIGTERM 종료 훅을 모두 완료하고 종료됐다
* SIGTERM 없이 중간 sh 만 3초 뒤 스스로 `exit 0` 하게 했더니 sh 가 끝나는 순간 컨테이너가 종료되고 앱은 훅도 못 돌고 사라졌다

시그널은 앱에 전달됐지만 PID 1 인 dumb-init 이 종료되면서 컨테이너도 종료되었다 \
dumb-init 의 버그가 아니라 사용 계약이고 [README 의 shell 경유 항목](https://github.com/Yelp/dumb-init/tree/v1.2.5#using-a-shell-for-pre-start-hooks) 이 shell 을 거치는 경우를 다루면서 `exec` 를 강조한다

> The `exec` portion of the bash command is important because it **replaces the bash process** with your server, so that the shell only exists momentarily at start.

## 판정 방법

dumb-init 이 없으면 유예시간 만료까지 기다리고 dumb-init 과 sh 를 함께 쓴 쪽은 반대로 165ms 에 끝나는데 둘 다 훅을 못 돌린 것이라 stop 시간만으로는 구분되지 않는다

같은 이미지에서 훅 길이만 바꿔보면 확실하다

| 훅 길이 | shell form CMD | exec 추가 |
|---|---|---|
| 0.2초 | 273ms | — |
| 0.5초 | — | 730ms |
| 3초 | 162ms | 3200ms |
| 8초 | 173ms | 8295ms |

훅을 8초로 늘려도 173ms 에 끝나면 훅이 아예 실행되지 않은 것이다 \
기준은 200ms 미만인지가 아니라 훅 길이를 바꿨을 때 stop 시간이 따라오는지다

더 빠른 판정은 프로세스 트리다

```bash
ps -ef | grep -c '[/]bin/sh -c java'   # 1 이면 깨진 구조, 0 이면 정상
```

dumb-init 의 자식이 앱이어야 하고 `/bin/sh -c ...` 가 끼어 있으면 안 된다

## 고치는 법

`CMD` 의 실행 명령 앞에 `exec` 를 붙인다

```diff
-CMD java -jar /app/app.jar
+CMD exec java -jar /app/app.jar
```

sh 가 앱으로 치환되어 중간 계층이 사라지고 앱이 dumb-init 의 자식이 되므로 dumb-init 이 앱의 종료를 기다린다

shell 기능이 필요 없다면 처음부터 배열로 쓰면 된다

```dockerfile
ENTRYPOINT ["/bin/dumb-init", "--"]
CMD ["java", "-jar", "/app/app.jar"]
```

다만 shell 기능에 기대고 있으면 배열로는 표현되지 않는다

```dockerfile
CMD java `if [ "$APM_ENABLED" = "true" ]; then echo "-javaagent:/app/agent.jar"; fi` -jar /app/app.jar
```

명령 치환을 쓰더라도 `java` 앞에 `exec` 를 붙이면 치환은 그대로 두고 sh 만 없앨 수 있다

---

## 그동안 드러나지 않은 이유

해당 구조가 2년 넘게 유지됐는데 종료 시 SIGTERM 을 제대로 처리하지 못하고 있다는 사실은 인지하지 못했다 \
SIGTERM 을 받고 바로 종료되는 것으로 착각해 실제 종료 로그 등을 놓친 것도 이유로 보인다

pod 에 `deletionTimestamp` 가 찍히면 두 가지가 **동시에** 시작된다

```
pod 삭제 요청
  ├─ EndpointSlice 에서 ready=false 상태가 kube-proxy / ingress / mesh 로 전파
  └─ kubelet: preStop 실행 후 컨테이너에 SIGTERM 전송
```

왼쪽은 여러 컨트롤러를 거쳐 비동기로 퍼지고 kubelet 은 전파가 끝났는지 알지 못한다 \
`preStop` 으로 `sleep 5` 를 걸어두면 5초 동안 앱은 계속 살아서 요청을 처리하고 endpoint 제외도 함께 전파된다 \
`preStop` 이 요청을 막는 것이 아니라 전파 시간을 벌어주는 것이다

그래서 SIGTERM 이 도달하는 시점에는 새 요청이 들어오지 않고 짧은 요청도 대부분 끝나 있다 \
앱이 종료 훅을 못 돌아도 SIGTERM 시점에 처리 중인 요청이 거의 없으니 밖에서는 아무 일도 없는 것처럼 보이고 일부 실패는 클라이언트 재시도가 흡수한다

호출이 전부 unary 라 `preStop` 을 넘기는 긴 요청 자체가 드물었고 메시지 컨슈머는 offset 커밋 전에 죽어도 재전달되므로 처리가 멱등하면 드러나지 않는다

## preStop 이 없으면

EndpointSlice 제외가 모든 트래픽 유입 경로로 전파되는 시간을 보장하는 장치가 없으므로 SIGTERM 이 전파보다 먼저 도착할 수 있다 \
전파가 끝나기 전까지 LB 나 mesh 는 pod 를 아직 살아 있는 대상으로 알고 요청을 계속 보낸다

* 종료 처리가 immediate 면 소켓이 바로 닫히므로 처리 중이던 요청까지 함께 끊긴다 \
  Spring Boot 는 2.x 와 3.3 까지 `server.shutdown` 기본값이 `immediate` 라 따로 켜지 않았으면 여기에 해당한다
* graceful 이면 신규 요청은 더 이상 처리하지 않고 in-flight 요청이 모두 처리되기까지 기다린다 \
  기존 요청은 처리되지만 신규 요청은 거부되는데 endpoint 에서 이미 지워진 뒤라면 신규 요청 자체가 들어오지 않으므로 문제가 되지 않는다 \
  전파가 끝나기 전이라면 LB 가 보낸 신규 요청이 거부되어 connection refused 나 reset 으로 실패한다

둘의 차이는 이미 처리 중이던 요청을 살리느냐지 전파가 끝나기 전에 들어온 신규 요청을 살리는 것이 아니다 \
신규 요청은 `preStop` 으로 시간을 벌어주는 수밖에 없다

## 사이드카가 있으면

sidecar 가 먼저 죽으면 앱이 종료 과정에서 하는 외부 호출이 전부 실패한다 \
`initContainers` 에 `restartPolicy: Always` 를 주면 kubelet 이 [native sidecar](https://kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/) 로 인식해 일반 컨테이너가 전부 끝난 뒤에야 sidecar 에 SIGTERM 을 보낸다

유예시간은 단계마다 새로 주어지는 것이 아니라 pod 전체가 하나를 나눠 쓴다 \
`preStop` 5초에 유예시간이 기본값 30초면 앱에 남는 것은 25초이고 사이드카 종료까지 유예시간 안에 들어가야 한다

## 실제 환경에서의 확인

`exec` 를 적용한 서비스에 15초 동안 유지되는 RPC 를 일부러 걸어둔 채로 pod 를 정상 삭제했더니 RPC 는 15초 가량을 채우고 exit 0 으로 끝났고 pod 삭제에는 18초 가량이 걸렸다 \
적용 전 서비스는 정상 삭제에서 종료 로그가 한 건도 남지 않는데 앱 프로세스에 직접 SIGTERM 을 보내면 종료 로그가 정상적으로 남는다

## 남은 것

`exec` 는 SIGTERM 이 앱까지 도달하게 만들 뿐이고 SIGTERM 을 받고 난 뒤에는 어플리케이션에서 graceful 하게 종료될 수 있도록 설정해야 한다 \
아직 처리 중인 요청을 모두 완료하고 종료하려면 Spring Boot 의 `server.shutdown` 을 `graceful` 로 설정해야 한다 \
기본값은 2.x 와 3.3 까지 `immediate` 이고 3.4 부터 `graceful` 이라 3.3 이하면 직접 명시해야 한다

`terminationGracePeriodSeconds` 는 처리 중인 요청의 소요 시간 상한을 감안해 잡아야 한다 \
유예시간이 지나면 kubelet 이 SIGKILL 을 보내므로 남은 요청은 실패 처리된다

## 여담

`preStop` 으로 `sleep` 을 거는 것은 오랫동안 `exec: ["sleep", "5"]` 였는데 이미지에 `sleep` 바이너리가 있어야 하고 프로세스도 하나 뜬다 \
[sleep action](https://github.com/kubernetes/enhancements/tree/master/keps/sig-node/3960-pod-lifecycle-sleep-action) 이 1.29 알파, 1.30 베타를 거쳐 1.34 에서 stable 이 되면서 kubelet 이 직접 처리하게 됐다

```yaml
lifecycle:
  preStop:
    sleep:
      seconds: 5
```
