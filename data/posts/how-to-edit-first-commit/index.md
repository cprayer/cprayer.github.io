---
title: 첫 번째 커밋 메세지 수정하기
createdDate: '2018-10-09'
updatedDate: '2018-10-09'
author: cprayer
tags:
  - git
draft: false
---

## TL; DR

``` bash
git rebase -i --root $tip
```

위의 명령어를 입력하면 해당 브랜치로 체크아웃하고 해당 브랜치의 첫 번째 커밋부터 모든 커밋 내용을 변경할 수 있습니다. 브랜치를 생략하면 현재 브랜치로 지정이 됩니다.

**주의 !!!** git 2.7.4에서는 --root 옵션을 주고 위의 명령어를 수행하면 모든 커밋 내용에 아무런 변경이 없는 경우에도 모든 해시 값이 바뀝니다. git 2.19.1에서는 이러한 현상이 발생하지 않았습니다.

## 소개

 git을 사용하다 보면, 과거의 커밋 내용을(커밋들끼리 합치거나, 커밋 메세지 수정, 커밋 순서 변경 등) 변경하고 싶은 경우가 발생합니다. 이런 경우 rebase 명령과 interactive 옵션을 이용하면 특정 커밋 이후의 커밋 내용을 바꿀 수 있게 됩니다. 바뀐 커밋을 기준으로 그 이후의 모든 커밋 해시 값이 바뀌기 때문에 원격 저장소에 이미 올라간 커밋의 경우는 최대한 수정하지 않도록 해야 합니다.

``` bash
git commit --amend
```

제일 최신 커밋의 메세지를 바꾸려는 경우 commit 명령의 --amend 옵션을 사용하면 됩니다. 해당 명령어를 수행하면 편집기 창이 나오고 기존 커밋 메세지 내용이 적혀 있습니다. 이를 원하는 메세지로 수정 후 저장하면 커밋 메시지가 바뀝니다.

``` bash
git rebase -i $base
```

바로 이전의 커밋이 아닌 더 이전의 커밋 메세지를 바꾸려는 경우 위의 명령어를 통해 $base 커밋의 이후 커밋부터의 내용을 변경할 수 있습니다. 해당 명령어를 수행하면 다음과 같은 편집기 창이 나옵니다.

b11d7ab(첫 번째 커밋) - 8a8b2bb - dd389f4 - 2807527 - e5dd3d5(최신 커밋)

제 브랜치는 다음과 같은 상태이고 git rebase -i b11d7ab 명령어를 수행한 결과입니다.

``` bash
pick 8a8b2bb 포스트 추가
pick dd389f4 포스트 UI 관련 전역 설정 수정
pick 2807527 mathjax 스크립트 추가
pick e5dd3d5 포스트 내용 수정

# Commands:
# p, pick = use commit
# r, reword = use commit, but edit the commit message
# e, edit = use commit, but stop for amending
# s, squash = use commit, but meld into previous commit
# f, fixup = like "squash", but discard this commit's log message
# x, exec = run command (the rest of the line) using shell
# d, drop = remove commit
```

커밋의 pick을 r이나 reword로 수정하고 저장하면 바꾸려는 커밋 메세지가 적혀 있는 편집기 창이 나타납니다. 커밋 메세지를 변경하고 저장하면 커밋 메세지가 바뀝니다. (다른 명령어의 기능이 궁금하다면 [GIT 도구 히스토리 단장하기](https://git-scm.com/book/ko/v2/Git-%EB%8F%84%EA%B5%AC-%ED%9E%88%EC%8A%A4%ED%86%A0%EB%A6%AC-%EB%8B%A8%EC%9E%A5%ED%95%98%EA%B8%B0')에서 확인하시면 됩니다.)

다음과 같이 특정 커밋을 기준으로 그 이후 커밋 내용을 변경할 수 있도록 되어 있어 첫 번째 커밋 이전 커밋을 지정할 수 없기에 첫 번째 커밋의 내용은 변경할 수 없습니다.

## 결론

따라서 이를 해결하기 위해 git에서는 1.7.12부터 rebase 명령에 --root라는 옵션을 통해 첫 번째 커밋부터 내용을 변경할 수 있도록 지원합니다. 브랜치를 생략하면 현재 브랜치를 기준으로 작업합니다.

``` bash
git rebase -i --root $tip
```

**주의 !!!** git 2.7.4에서는 --root 옵션을 주고 위의 명령어를 수행하면 모든 커밋 내용에 아무런 변경이 없어도 모든 해시 값이 바뀝니다. git 2.19.1에서는 이러한 현상이 발생하지 않았습니다.

git rebase -i root를 수행한 결과는 다음과 같습니다.

``` bash
pick b11d7ab First commit
pick 8a8b2bb 포스트 추가
pick dd389f4 포스트 UI 관련 전역 설정 수정
pick 2807527 mathjax 스크립트 추가
pick e5dd3d5 포스트 내용 수정
```

첫 번째 커밋도 포함되어 나오는 것을 확인할 수 있습니다. 이제 첫 번째 커밋도 내용 변경이 가능합니다.

## 덤

``` bash
git rebase -i --root $tip
```

위의 명령어는 아래와 동일한 명령어입니다.

``` bash
git checkout $tip
git rebase -i --root
```

``` bash
git rebase $base $tip
```
마찬가지로 위의 명령어는 아래와 동일한 명령어입니다.

``` bash
git checkout $tip
git rebase $base
```

## 참고

- [https://stackoverflow.com/questions/2246208/change-first-commit-of-project-with-git](https://stackoverflow.com/questions/2246208/change-first-commit-of-project-with-git)
- [https://raw.githubusercontent.com/git/git/master/Documentation/RelNotes/1.7.12.txt](https://raw.githubusercontent.com/git/git/master/Documentation/RelNotes/1.7.12.txt)
