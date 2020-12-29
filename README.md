<p align="center">
  <img width="150" src="./logo.svg" alt="logo"></p>
</p>

<h1 align="center">채식 사이</h1>

<div align="left">

채식주의자를 위한 가공 식품 원재료 분석
어플리케이션

</div>

# 사용 언어, 프레임워크
Javascript, NodeJs

# 구조

## Block Diagram
<p align="left">
  <img width="500" src="./BlockDiagram.svg" alt="block-diagram-logo">
</p>

## Server
 Naver OCR API를 통해 넘어온 텍스트들이 Application에서 넘어온다면., [유효 텍스트 추출 모듈]이 불필요한 텍스트를 제거해준다. 이렇게 처리된 텍스트들과 사용자의 정보 데이터를 비교하여 사용자 채식주의 단계에 맞는 식품인지 확인한다. 만약 사용자에게 적합한 음식일 경우 application에 데이터를 전송하고, 적합하지 않은 음식의 경우 [대체 식품 추천 모듈]이 작동해 성분이 비슷한 식품을 찾아낸다.

 ## 배포 관리
 Heroku를 통해서 서버 배포


# 사용 공공 api

- ### [식품 원재료 정보(DB) 서비스](https://www.patreon.com/oliviertassinari)

- ### [식품안전나라](https://www.foodsafetykorea.go.kr/)

- ### [HACCP](https://www.data.go.kr/data/15058665/openapi.do)
