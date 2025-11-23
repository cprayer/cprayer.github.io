---
title: docker image size는 압축 가능 
createdDate: '2025-11-23'
updatedDate: '2025-11-23'
author: cprayer
tags:
  - ECR
  - docker
  - docker-registry
draft: false
---

동일한 이미지 태그를 가진 이미지가 ECR 내에서 볼 때와 로컬 `docker images ls` 명령을 통해 봤을 때 로컬 이미지 용량이 더 컸었다

왜 그런지 찾아보니 [Viewing the contents and details of a repository in Amazon ECR public](https://docs.aws.amazon.com/ko_kr/AmazonECR/latest/public/public-repository-info.html) 페이지를 찾을 수 있었고 아래와 같이 나와 있었다

>> Note
Beginning with Docker version 1.9, the Docker client compresses image layers before pushing them to a V2 Docker registry. The output of the docker images command shows the uncompressed image size. Therefore, the image size that's returned might be larger than the image sizes that are shown in the AWS Management Console.

ECR에 올라와 있는 이미지는 압축된 이미지, 로컬은 압축 해제된 이미지 사이즈를 보여준다
