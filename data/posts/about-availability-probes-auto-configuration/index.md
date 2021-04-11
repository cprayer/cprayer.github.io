---
title: AvailablityProbesAutoConfiguration에 대해 알아보자(spring boot readiness, liveness 관련)
createdDate: '2021-04-11'
updatedDate: '2021-04-11'
author: cprayer
tags:
  - spring-boot
  - troubleshooting
  - k8s-probe
draft: false
---

## 서두

spring boot에서는 2.3부터 컨테이너 헬스 체크를 위한 probe 관련 엔드포인트를 노출합니다. ([링크](https://docs.spring.io/spring-boot/docs/2.3.0.RELEASE/reference/html/production-ready-features.html#production-ready-kubernetes-probes))

```yaml
livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: liveness-port
  failureThreshold: ...
  periodSeconds: ...

readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: liveness-port
  failureThreshold: ...
  periodSeconds: ...
```

별도 프로퍼티 설정 없이 해당 기능을 잘 사용하고 있었는데요. 배포 직후 첫 번째 probe를 시도할 때 간헐적으로 타임아웃이 발생하는 문제가 발생하여 알림이 오는 경우가 있었습니다.
그래서 해당 원인이 무엇인지 분석하기 위해 동일한 어플리케이션을 로컬에서 구동시킨 후, 해당 엔드포인트에 요청을 보냈더니 404 에러를 보게 되었습니다.

쿠버네티스의 경우 200 이상 399 이하의 http status code가 반환되는 경우에만 정상적인 상태라고 인식합니다. ([링크](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-a-liveness-http-request))

> Any code greater than or equal to 200 and less than 400 indicates success. Any other code indicates failure.

즉, 쿠버네티스 클러스터 내에서도 404 에러가 발생했다면 readiness / liveness health check 실패로 인해 정상 배포가 되지 않았을텐데요. \
첫 요청이 간헐적으로 실패하는 문제를 제외하고는 정상적으로 동작하고 있었습니다.

> Spring Boot manages your Application Availability State out-of-the-box. If deployed in a Kubernetes environment, actuator will gather the "Liveness" and "Readiness" information from the ApplicationAvailability interface and use that information in dedicated Health Indicators: LivenessStateHealthIndicator and ReadinessStateHealthIndicator. These indicators will be shown on the global health endpoint ("/actuator/health"). They will also be exposed as separate HTTP Probes using Health Groups: "/actuator/health/liveness" and "/actuator/health/readiness".
 
문서에는 다음과 같이 쿠버네티스 환경인 경우에는 readiness, readiness에 필요한 정보를 수집하고 엔드포인트를 수집한다고 나와 있습니다. \
그렇다면 어떤 환경일 때 어떻게 등록되는걸까요? 관련된 정보를 찾던 도중 AvailablityProbesAutoConfiguration을 찾게 되었습니다.

## AvailabilityProbesAutoConfiguration 코드를 확인해보자

```java
@Configuration(proxyBeanMethods = false)
@Conditional(AvailabilityProbesAutoConfiguration.ProbesCondition.class)
@AutoConfigureAfter({ AvailabilityHealthContributorAutoConfiguration.class,
        ApplicationAvailabilityAutoConfiguration.class })
public class AvailabilityProbesAutoConfiguration {
    @Bean
    @ConditionalOnMissingBean(name = "livenessStateHealthIndicator")
    public LivenessStateHealthIndicator livenessStateHealthIndicator(ApplicationAvailability applicationAvailability) {
        return new LivenessStateHealthIndicator(applicationAvailability);
    }

    @Bean
    @ConditionalOnMissingBean(name = "readinessStateHealthIndicator")
    public ReadinessStateHealthIndicator readinessStateHealthIndicator(
            ApplicationAvailability applicationAvailability) {
        return new ReadinessStateHealthIndicator(applicationAvailability);
    }

    @Bean
    public AvailabilityProbesHealthEndpointGroupsPostProcessor availabilityProbesHealthEndpointGroupsPostProcessor() {
        return new AvailabilityProbesHealthEndpointGroupsPostProcessor();
    }
    
    //...
}
```
AvailabilityProbesAutoConfiguration은 위와 같이 Conditional 어노테이션을 가지고 있습니다. 해당 어노테이션 내에 정의된 ProbesCondition은 AvailabilityProbesAutoConfiguration 클래스 내에 static nested class로 정의되어 있습니다.

```java
static class ProbesCondition extends SpringBootCondition {

    private static final String ENABLED_PROPERTY = "management.endpoint.health.probes.enabled";

    private static final String DEPRECATED_ENABLED_PROPERTY = "management.health.probes.enabled";

    @Override
    public ConditionOutcome getMatchOutcome(ConditionContext context, AnnotatedTypeMetadata metadata) {
        Environment environment = context.getEnvironment();
        ConditionMessage.Builder message = ConditionMessage.forCondition("Probes availability");
        ConditionOutcome outcome = onProperty(environment, message, ENABLED_PROPERTY);
        if (outcome != null) {
            return outcome;
        }
        outcome = onProperty(environment, message, DEPRECATED_ENABLED_PROPERTY);
        if (outcome != null) {
            return outcome;
        }
        if (CloudPlatform.getActive(environment) == CloudPlatform.KUBERNETES) { // 주목!
            return ConditionOutcome.match(message.because("running on Kubernetes"));
        }
        return ConditionOutcome.noMatch(message.because("not running on a supported cloud platform"));
    }

    private ConditionOutcome onProperty(Environment environment, ConditionMessage.Builder message,
                                        String propertyName) {
        String enabled = environment.getProperty(propertyName);
        if (enabled != null) {
            boolean match = !"false".equalsIgnoreCase(enabled);
            return new ConditionOutcome(match, message.because("'" + propertyName + "' set to '" + enabled + "'"));
        }
        return null;
    }

}
```

해당 소스 코드를 보면 **CloudPlatform.getActive(environment) == CloudPlatform.KUBERNETES** 라는 부분이 관련이 있을 것 같습니다. 해당 부분을 좀 더 확인해보겠습니다.

```java
public enum CloudPlatform {
    NONE {

        @Override
        public boolean isDetected(Environment environment) {
            return false;
        }

    },
    
    //...

    KUBERNETES {

        private static final String KUBERNETES_SERVICE_HOST = "KUBERNETES_SERVICE_HOST";

        private static final String KUBERNETES_SERVICE_PORT = "KUBERNETES_SERVICE_PORT";

        private static final String SERVICE_HOST_SUFFIX = "_SERVICE_HOST";

        private static final String SERVICE_PORT_SUFFIX = "_SERVICE_PORT";

        @Override
        public boolean isDetected(Environment environment) {
            if (environment instanceof ConfigurableEnvironment) {
                return isAutoDetected((ConfigurableEnvironment) environment);
            }
            return false;
        }

        private boolean isAutoDetected(ConfigurableEnvironment environment) {
            PropertySource<?> environmentPropertySource = environment.getPropertySources()
                    .get(StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME);
            if (environmentPropertySource != null) {
                if (environmentPropertySource.containsProperty(KUBERNETES_SERVICE_HOST)
                        && environmentPropertySource.containsProperty(KUBERNETES_SERVICE_PORT)) {
                    return true;
                }
                if (environmentPropertySource instanceof EnumerablePropertySource) {
                    return isAutoDetected((EnumerablePropertySource<?>) environmentPropertySource);
                }
            }
            return false;
        }

        private boolean isAutoDetected(EnumerablePropertySource<?> environmentPropertySource) {
            for (String propertyName : environmentPropertySource.getPropertyNames()) {
                if (propertyName.endsWith(SERVICE_HOST_SUFFIX)) {
                    String serviceName = propertyName.substring(0,
                            propertyName.length() - SERVICE_HOST_SUFFIX.length());
                    if (environmentPropertySource.getProperty(serviceName + SERVICE_PORT_SUFFIX) != null) {
                        return true;
                    }
                }
            }
            return false;
        }

    };
    
    //...
    
    /**
     * Returns the active {@link CloudPlatform} or {@code null} if one is not active.
     * @param environment the environment
     * @return the {@link CloudPlatform} or {@code null}
     */
    public static CloudPlatform getActive(Environment environment) {
        if (environment != null) {
            for (CloudPlatform cloudPlatform : values()) {
                if (cloudPlatform.isActive(environment)) {
                    return cloudPlatform;
                }
            }
        }
        return null;
    }

    /**
     * Determines if the platform is active (i.e. the application is running in it).
     * @param environment the environment
     * @return if the platform is active.
     */
    public boolean isActive(Environment environment) {
        return isEnforced(environment) || isDetected(environment);
    }

    /**
     * Determines if the platform is enforced by looking at the
     * {@code "spring.main.cloud-platform"} configuration property.
     * @param environment the environment
     * @return if the platform is enforced
     * @since 2.3.0
     */
    public boolean isEnforced(Environment environment) {
        return isEnforced(environment.getProperty(PROPERTY_NAME));
    }

    /**
     * Determines if the platform is detected by looking for platform-specific environment
     * variables.
     * @param environment the environment
     * @return if the platform is auto-detected.
     * @since 2.3.0
     */
    public abstract boolean isDetected(Environment environment);
}
```

(메소드 순서를 변경하거나 일부 enum, 메소드를 생략하였습니다.)

다음과 같이 CloudPlatform은 enum으로 선언되어 있고, getActive 메소드는 isActive 메소드를 통해 spring.main.cloud-platform 프로퍼티를 통해 특정 클라우드 플랫폼으로 강제되었는지(isEnforced), 혹은 특정 클라우드 플랫폼 환경에만 존재하는 환경 변수(isDetected) 여부를 파악하여 현재 사용하는 클라우드 플랫폼을 결정합니다.

isDetected 메소드의 경우 추상 메소드로 정의되어 있는데요. 이는 각 enum 필드마다 override하여 각자 자기의 클라우드 플랫폼인지 여부를 detect합니다.

쿠버네티스 플랫폼의 경우 KUBERNETES_SERVICE_HOST, KUBERNETES_SERVICE_PORT 환경 변수가 존재하는지, environmentPropertySource가 순회 가능하다면 동일한 이름을 가지고 _SERVICE_HOST, _SERVICE_PORT를 접미사로 가지는 환경변수가 존재하는지 여부로 판단합니다.

## 정리 및 결론

* Conditional 어노테이션을 달고 있는 auto configuration 클래스는 Conditional 어노테이션에 등록된 condition 클래스의 matches 메소드가 참을 반환하면 해당 configuration 클래스 내의 빈을 등록하고 아니라면 등록하지 않습니다.
* 쿠버네티스 환경인 경우 자동적으로 /actuator/health/liveness, /actuator/health/readiness 엔드포인트가 활성화됩니다.
* 로컬에서도 활성화시키고 싶은 경우 management.endpoint.health.probes.enabled 프로퍼티의 값을 true로 설정해주시면 됩니다. (사실 false 이외의 값이라면 뭐든지 가능합니다)
* 간헐적으로 타임아웃이 발생한 원인은 timeout second가 타이트하여 발생했던 것으로 추정됩니다. (default 1초) 현재는 이와 같은 문제가 발생하지 않는데요. 관련해서는 추후 더 알아볼 예정입니다.
