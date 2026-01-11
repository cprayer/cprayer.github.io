---
title: spring boot 2 / 3 / 4(spring batch 4 / 5 / 6) 에서 배치용 datasource / platformTransactionManager 설정 방법
createdDate: '2025-12-24'
updatedDate: '2025-12-24'
author: cprayer
tags:
  - spring
  - spring-batch
draft: false
---


### spring boot 2.7.4(spring batch 4)

* 하나의 datasource만 사용하는 경우에는 EnableBatchProcessing 어노테이션 + application.yaml(spring.datasource) 로 설정하면 됨
* 위 방법만으로 원하는 설정이 불가능한 경우에는 아래와 같이 진행
* DefaultBatchConfigurer의 getTransactionManager / set(get)DataSource override를 통해 가능해보임
* in-memory로 쓰고 싶은 경우 DefaultBatchConfigurer의 setDataSource 메소드를 override하면 MapJobRepository 로 사용 가능
```kotlin
@Configuration
class BatchConfig: DefaultBatchConfigurer() {
    override fun setDataSource(dataSource: DataSource) {
        // do nothing
    }
}
```

### spring boot 3.2.5(spring batch 5)

* 하나의 datasource만 사용하는 경우에는 EnableBatchProcessing 어노테이션 + application.yaml(spring.datasource) 로 설정하면 됨
* 위 방법만으로 원하는 설정이 불가능한 경우에는 아래와 같이 진행
* DefaultBatchConfiguration의 getTransactionManager / getDataSource override를 통해 가능할 것으로 보임
* in-memory로 쓰고 싶은 경우 h2 database 사용 필요. DefaultBatchConfigurer / MapJobRepository 가 removed 되어 아래와 같이 연동
```kotlin
@Configuration
class BatchConfig : DefaultBatchConfiguration() {
  // override 하지 않으면 primary DataSource bean 이 주입됨
  override fun getDataSource(): DataSource {
    return datasource
  }

  // override 하지 않으면 primary PlatformTransactionManager bean 이 주입됨
  override fun getTransactionManager(): PlatformTransactionManager {
    return DataSourceTransactionManager(dataSource)
  }

  // BatchAutoConfiguration 가 @ConditionalOnMissingBean(value = DefaultBatchConfiguration.class, annotation = EnableBatchProcessing.class) 어노테이션을 가지고 있음
  // 이로 인해 DefaultBatchConfiguration 를 상속받은 Configuration이 있으면 JobLauncherApplicationRunner 가 등록되지 않아 bean 등록
  @Bean
  fun jobLauncherApplicationRunner(
    jobLauncher: JobLauncher,
    jobExplorer: JobExplorer,
    jobRepository: JobRepository,
  ): JobLauncherApplicationRunner = JobLauncherApplicationRunner(jobLauncher, jobExplorer, jobRepository)

  companion object {
    // DefaultBatchConfiguration bean lite mode(proxyBeanMethods = false)로 인해 getDataSource 메소드 내에 두면 여러 번 호출되어 동일한 DB 엔드포인트로 DDL 여러 번 발생
    private val datasource = EmbeddedDatabaseBuilder()
      .setType(EmbeddedDatabaseType.H2)
      .addScript("org/springframework/batch/core/schema-h2.sql")
      .build()
  }
}
```

### spring boot 4(spring batch 6)

* EnableBatchProcessing 어노테이션 + application.yaml(spring.datasource) 로 설정하면 됨
* 위 방법만으로 원하는 설정이 불가능한 경우에는 아래와 같이 진행
* BatchAutoConfiguration + BatchDataSource / BatchTransactionManager 어노테이션을 통해 dataSource / transactionManager 를 등록하면 되는 것으로 보임

## 여담

* spring boot 3.2.5에서 DefaultBatchConfiguration 에 의해 getDataSource 메소드가 여러 번 호출됨
* DefaultBatchConfiguration는 bean lite mode로 되어 있어 호출 시마다 EmbeddedDatabaseBuilder 가 다시 build되면서 동일한 테이블에 대해 DDL이 여러 번 나가게 되었음
* 이로 인해 `Table already exists` 에러가 발생하며 어플리케이션 기동이 실패함. 이전에 [spring bean lite mode에 대해 공부](https://cprayer.github.io/posts/2021-03-17-about-bean-lite-mode/)한 적이 있어 디버깅하는 시간을 단축할 수 있었음
* spring boot 3.2.5 에서는 BatchDataSource 어노테이션만 있고 BatchTransactionManager 어노테이션으로 배치용 TransactionManager Bean을 별도 주입받는게 안되는 것으로 보여 컨트리뷰션 할 수도 있겠다 싶어 찾아봤는데 spring batch 6에는 이미 추가되어 있어 실패😢
