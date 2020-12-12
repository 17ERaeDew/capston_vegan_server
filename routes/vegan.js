/* eslint-env es6 */
/* eslint-disable */
var express = require('express');
var router = express.Router();
var axios = require('axios');
var request = require('request');
var convert = require('xml-js');
let cheerio = require('cheerio');

var whichVegan = 0; // 0= 플렉시테리언 / 1=폴로/2=페스코/3=락토오보/4=오보/5=락토/6=비건(풀만 먹는 사람)
var seafood = 0;

function foodDB(res, name){ //원재료 표준코드API
  const serviceKey = "pK02eCTJZvQmKmwKtQjIX1QHHHYNVJe07zo3zqeo3QLUb2u0uMxUZmZN%2BHF9jgWyuwy7HWVUeRwpXkRanDCDzw%3D%3D";
  // https://www.data.go.kr/data/15058665/openapi.do
  var url = 'http://apis.data.go.kr/1470000/FoodRwmatrInfoService/getFoodRwmatrList';
  var queryParams = '?' + encodeURIComponent('ServiceKey') + `=${serviceKey}`;
  queryParams += '&' + encodeURIComponent('rprsnt_rawmtrl_nm') + '=' + encodeURIComponent(name);
  queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('1');
  request({
      url: url + queryParams,
      method: 'GET'
  }, function (error, response, body) {
      $ = cheerio.load(body);
      $('item').each(function(idx){
          let no1 = $(this).find('LCLAS_NM').text();
          let no2 = $(this).find('MLSFC_NM').text();
          if (no2 == 3)
              seafood = 1;
          //console.log(`대분류: ${no1}\n중분류: ${no2}`);
          if(no1 == ' '){
              foodlist(res, name);
          }
          return {no1, no2};
      });
  });
}

function foodlist(res, name){ //식품첨가물 원재료명API
  //https://www.foodsafetykorea.go.kr/api/openApiInfo.domenu_grp=MENU_GRP31&menu_no=661&show_cnt=10&start_idx=1&svc_no=C002
  const serviceKey = '18aed2c27cdf47238a7b'; //dba8a479b09b4c1cbb36
  var url = `http://openapi.foodsafetykorea.go.kr/api/${serviceKey}/C002/JSON/1/1/PRDLST_NM=${encodeURIComponent(name)}`;
  request({
      url: url,
      method: 'GET',
  }, function (error, response, body) {
      console.log(body);
      return res.json({error: error, response: response, body: body});
  });
}

function HACCP(res, name){ //제품명API
  const serviceKey = "pK02eCTJZvQmKmwKtQjIX1QHHHYNVJe07zo3zqeo3QLUb2u0uMxUZmZN%2BHF9jgWyuwy7HWVUeRwpXkRanDCDzw%3D%3D";
  // https://www.data.go.kr/data/15058665/openapi.do
  var url = 'http://apis.data.go.kr/B553748/CertImgListService/getCertImgListService';
  var queryParams = '?' + encodeURIComponent('ServiceKey') + `=${serviceKey}`;
  queryParams += '&' + encodeURIComponent('prdlstNm') + '=' + encodeURIComponent(name);
  queryParams += '&' + encodeURIComponent('returnType') + '=' + encodeURIComponent('xml');
  queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('1');
  request({
      url: url + queryParams,
      method: 'GET'
  }, function (error, response, body) {
      $ = cheerio.load(body);
      $('item').each(function(idx){
          let na = $(this).find('prdlstNm').text(); //대체식품명
          let no1 = $(this).find('rawmtrl').text(); //대체식품 원재료
          let no2 = $(this).find('prdkind').text(); //대체식품 유형
          let no3 = $(this).find('imgurl1').text(); //대체식품 이미지
          console.log(`제품명: ${na}\n 원재료: ${no1}\n유형: ${no2}\n, 사진: ${no3}`);

          return res.json({제품명: na, 원재료: no1, 유형: no2, 사진: no3});
      });
  });
}

router.use('/sendText', (req, res) => {
  const { text, vegan } = req.body;//배열로 넘어옴 
  console.log('sendText success');

    var a = "제품명 치즈초코파이 식품유형 초콜릿 내용량 384g 업소명 및 소재지 롯데제과(주) 경남 양산시 양산대로 1158 유통기한 측면표기일까지(연.월.일) 내포장재질 폴리프로필렌 품목보고번호 19780614009442 밀가루(밀;미국산),탕,물엿,쇼트닝(가공유지(부분경화유;팜스터아린유(말레이시아산),동물성유지(호주산)),식물성지(부분경화유(말레이시아산); 원재료명 팜유,팜핵유),혼합분유,코코아분말(인도네시0산),D-소비톨액,글리서린,체다치즈분말(덴마크산),주정0.63%,유당,기타가공품,포도당,젤라틴,전란액,정제소금,산도조절제I,합성향료(치즈형,밀크향,바닐라향),산도절제Ⅱ,구연산,코코아마스(코코아빈;가나산),유화제I,신도조절제II,홍화황색소,유화제II,혼합제제(유화제,아라비아검,산도조절제),바닐린,잔탄검밀,쇠고기,대두,우유,돼지고기,계란 함유";
    var words = a.split(','); // 넘어온 텍스트 반점(,) 기준으로 나눠서 저장
    var findString = "식품유형";
    var rcmd = a.split(' '); // 대체식품 추천을 위해 필요
    var rcmdFood;
    
    // 넘어온 성분들 다 검색 
    var size = words.length; // 배열 크기
    var i = 0; 
    var j = 0;
    var k = 0;
    //var whichVegan = 0; // 0= 플렉시테리언 / 1=폴로/2=페스코/3=락토오보/4=오보/5=락토/6=비건(풀만 먹는 사람)
    var forVegan = " ";
    
    while(i<size){      
        if(j==size-1) // '함유' 제거하고 검색하기 위함
            words[j] = words[j].substring(0, words[j].indexOf(" ")-1);
        
        if(words[j].indexOf("(") != -1){ 
            foodDB(res, words[j].substring(0, words[j].indexOf("(")-1));
        }
        else{
            foodDB(res, words[j]); // api 불러와서 하나씩 검색
        }    
        j++;
        i++;
    }
    while(1){
        if (rcmd[k] == findString){
            rcmdFood = rcmd[k+1];
            
            break;
        }
        k++;
    }
    
    // 채식주의자 단계 판단  0= 플렉시테리언 / 1=폴로/2=페스코/3=락토오보/4=오보/5=락토/6=비건(풀만 먹는 사람)
    if(words.indexOf('돼지고기') != -1|| words.indexOf('쇠고기') != -1){
        whichVegan = 0;
        //console.log("플렉시테리언");
        forVegan = "플렉시테리언"; //에게 적합한 식품
        HACCP(res, rcmdFood);
        //return res.json(forVegan);
    }
    else if(words.indexOf('닭고기') != -1){
        whichVegan = 1;
        //console.log("폴로 베지테리언");
        forVegan = "폴로 베지테리언";
        HACCP(res, rcmdFood);
        //return res.json(forVegan);
    }
    else if(seafood==1 || words.indexOf('어육') != -1){
        whichVegan = 2;
        //console.log("페스코 베지테리언");
        forVegan = "페스코 베지테리언";
        HACCP(res, rcmdFood);
        //return res.json(forVegan);
    }
    else if(words.indexOf('계란') != -1){
        if(words.indexOf('우유') != -1){
            whichVegan = 3;
            //console.log("락토오보 베지테리언");
            forVegan = "락토오보 베지테리언";
            HACCP(res, rcmdFood);
            //return res.json(forVegan);
        }
        else{
            whichVegan = 4;
            //console.log("오보 베지테리언");
            forVegan = "오보 베지테리언";
            HACCP(res, rcmdFood);
            //return res.json(forVegan);
        }
    }
    else if(words.indexOf('우유') != -1){
        whichVegan = 5;
        //console.log("락토 베지테리언");
        forVegan = "락토 베지테리언";
        HACCP(res, rcmdFood);
        //return res.json(forVegan);
    }
    else{
        whichVegan = 6;
        //console.log("비건");
        forVegan = "비건";
        //return res.json(forVegan);
    }
    //return res.json(whichVegan);
});

module.exports = router;