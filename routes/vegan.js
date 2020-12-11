/* eslint-env es6 */
/* eslint-disable */
var express = require('express');
var router = express.Router();
var axios = require('axios');
var request = require('request');
var convert = require('xml-js');
let cheerio = require('cheerio');

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
          if(no2 == 3)
              seafood = 1;
      console.log(`대분류: ${no1}\n소분류: ${no2}`);
          if (no2 == "식물"){
                console.log("적합합니다.");
            }
            else{
                console.log("적합하지 않습니다.");
            }
      return {no1, no2};
      });
  });
}

function foodlist(res, name){ //식품첨가물 원재료명API
  //https://www.foodsafetykorea.go.kr/api/openApiInfo.domenu_grp=MENU_GRP31&menu_no=661&show_cnt=10&start_idx=1&svc_no=C002
  const serviceKey = '18aed2c27cdf47238a7b'; //dba8a479b09b4c1cbb36
  var url = `http://openapi.foodsafetykorea.go.kr/api/${serviceKey}/C002/JSON/1/5/PRDLST_NM=${encodeURIComponent(name)}`;
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
  queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('5');
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
          //console.log(`제품명: $(na}\n 원재료: ${no1}\n유형: ${no2}`);
          if (foodDB(res, name) == "식품원료(A코드)", "축산물"){
              console.log(`제품명: ${na}\n 원재료: ${no1}\n유형: ${no2}\n, 사진: ${no3}`);
              return {no1, no2};
          }
          else{
              console.log("대체불가")
          }
      });
  });
}

router.use('/sendText', (req, res) => { //foodDB
  const { text, vegan } = req.body;//배열로 넘어옴 
  console.log('sendText success');

    var words = text.split(','); // 넘어온 텍스트 반점(,) 기준으로 나눠서 저장
    console.log(words[0]); // 확인용
    console.log(words[2]); //확인용
    
    // 넘어온 성분들 다 검색 
    var size = words.length; // 배열 크기
    var i = 0; 
    var j = 0;
    var whichVegan = 0; // 0= 플렉시테리언 / 1=폴로/2=페스코/3=락토오보/4=오보/5=락토/6=비건(풀만 먹는 사람)
    var forVegan = " ";
    
    while(i<size){
        
        if(j==size-1) // '함유' 제거하고 검색하기 위함
            words[j] = words[j].subString(0, words[j].indexOf(" ")-1);
        
        if(words[j].indexOf("(") != -1){ 
            foodDB(res, words[j].substring(0, words[j].indexOf("(")-1));
        }
        else{
            foodDB(res, words[j]); // api 불러와서 하나씩 검색
        }    
    
        j++;
        i++;
    }
    
    // 채식주의자 단계 판단  0= 플렉시테리언 / 1=폴로/2=페스코/3=락토오보/4=오보/5=락토/6=비건(풀만 먹는 사람)
        if(words.includes("돼지고기") || words.includes("쇠고기")){
            whichVegan = 0;
            console.log("플렉시테리언");
            forVegan = "플렉시테리언";
            return res.json(forVegan);
        }
        else if(words.includes("닭고기")){
            whichVegan = 1;
            console.log("폴로 베지테리언");
            forVegan = "폴로 베지테리언";
            return res.json(forVegan);
        }
        else if(seafood==1 || words.incluldes("어육")){
            whichVegan = 2;
            console.log("페스코 베지테리언");
            forVegan = "페스코 베지테리언";
            return res.json(forVegan);
        }
        else if(words.includes("계란")){
            if(words.includes("우유")){
                whichVegan = 3;
                console.log("락토오보 베지테리언");
                forVegan = "락토오보 베지테리언";
                return res.json(forVegan);
            }
            else{
                whichVegan = 4;
                console.log("오보 베지테리언");
                forVegan = "오보 베지테리언";
                return res.json(forVegan);
            }
        }
        else if(words.includes("우유")){
            whichVegan = 5;
            console.log("락토 베지테리언");
            forVegan = "락토 베지테리언";
            return res.json(forVegan);
        }
        else{
            whichVegan = 6;
            console.log("비건");
            forVegan = "비건";
            return res.json(forVegan);
        }
    
  /*  
  // api불러와서 검색
  foodDB(res, 'Abiu열매');
  foodlist(res, '어묵');
  HACCP(res, '물엿');
  */
});

module.exports = router;