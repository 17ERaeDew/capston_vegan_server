<p align="center">
  <img width="150" src="./logo.svg" alt="logo"></p>
</p>

<h1 align="center">채식 사이</h1>

<div align="left">

채식주의자를 위한 가공 식품 원재료 분석
어플리케이션

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/mui-org/material-ui/blob/master/LICENSE)
</div>

### [어플리케이션 github](https://github.com/osydoo/capston_vegan)

# 구조

## Block Diagram
<p align="left">
  <img width="500" src="./BlockDiagram.svg" alt="block-diagram-logo">
</p>

## Application
[Block Diagram]에서 User가 카메라로 사진을 찍거나 기존 이미지를 어플리케이션에 등록한다. 처음으로 [사용자 정보 입력 모듈]을 통해 채식주의자 종류를 선택한다. 기존 사용자의 경우 [인증 모듈]을 통해 사용자를 인증 한 뒤, [사용자 정보 호출 모듈]을 통해 자신의 기존 활동 이력이나, 정보를 불러온다. 이후 어플리케이션에서 사용자가 이미지를 등록하거나 사진을 찍어서 업로드를 진행하면 Naver OCR API를 통해 텍스트 값을 받아온 뒤 [API Server]로 전송한다

## Server
 Naver OCR API를 통해 넘어온 텍스트들이 Application에서 넘어온다면., [유효 텍스트 추출 모듈]이 불필요한 텍스트를 제거해준다. 이렇게 처리된 텍스트들과 사용자의 정보 데이터를 비교하여 사용자 채식주의 단계에 맞는 식품인지 확인한다. 만약 사용자에게 적합한 음식일 경우 application에 데이터를 전송하고, 적합하지 않은 음식의 경우 [대체 식품 추천 모듈]이 작동해 성분이 비슷한 식품을 찾아낸다.

 ## 배포 관리
 Heroku를 통해서 서버 배포


# 사용 공공 api

- ### [식품 원재료 정보(DB) 서비스](https://www.patreon.com/oliviertassinari)

- ### [식품안전나라](https://www.foodsafetykorea.go.kr/)

- ### [HACCP](https://www.data.go.kr/data/15058665/openapi.do)

# 사용 api

- ### [NAVER OCR](https://www.ncloud.com/product/aiService/ocr)