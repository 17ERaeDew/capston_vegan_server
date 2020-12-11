var express = require('express');
var router = express.Router();
var axios = require('axios');
var request = require('request');
var convert = require('xml-js');
let cheerio = require('cheerio');


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
  // https://www.foodsafetykorea.go.kr/api/openApiInfo.do?menu_grp=MENU_GRP31&menu_no=661&show_cnt=10&start_idx=1&svc_no=C002
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
  foodDB(res, '쇼트닝');

//팜유,팜핵유),혼합분유,코코아분말(인도네시0산),D-소비톨액,글리서린,체다치
//즈분말(덴마크산),주정0.63
//%,유당,기타가공품,포도당,젤라틴,전란액,정제소금,산도
//조절제I,합성향료(치즈형,밀크향,바닐라향),산도절제Ⅱ,구연산,코코아마스(코코아
//빈;가나산),유화제I,신도조절제II,홍화황색소,유화제II,혼합제제(유화제,아라비아검,
//산도조절제),바닐린,잔탄검
//밀,쇠고기,대두,
//우유,
//돼지고기,
//계란 함유');
  //foodlist(res, '돈까스');
  //HACCP(res, '돈까스');
});

router.use('/getText', (req, res) => { //HACCP
  const { text, vegan } = req.body;//배열로 넘어옴
  console.log('sendText success');
  //foodDB(res, '돈까스');
  //foodlist(res, '돈까스');
  HACCP(res, '밀가루');
});

module.exports = router;

/*
food DB result example
<response>
<header>
<resultCode>00</resultCode>
<resultMsg>NORMAL SERVICE.</resultMsg>
</header>
<body>
<numOfRows>10</numOfRows>
<pageNo>1</pageNo>
<totalCount>2</totalCount>
<items>
<item>
<LCLAS_NM>식품원료(A코드)</LCLAS_NM>
<MLSFC_NM>식물</MLSFC_NM>
<RPRSNT_RAWMTRL_NM>Abiu열매</RPRSNT_RAWMTRL_NM>
<RAWMTRL_NCKNM/>
<ENG_NM>Yellow star apple, Caimito, Caimo, Luma</ENG_NM>
<SCNM>Pouteria caimito Radlk , Lucuma caimito Roem. &amp; Schult , Achras caimito Ruiz &amp; Pavon</SCNM>
<REGN_CD_NM>열매</REGN_CD_NM>
<RAWMTRL_STATS_CD_NM/>
<USE_CND_NM>사용가능부위 : 열매</USE_CND_NM>
</item>
<item>
<LCLAS_NM>식품원료(A코드)</LCLAS_NM>
<MLSFC_NM>식물</MLSFC_NM>
<RPRSNT_RAWMTRL_NM>Abiu열매분말</RPRSNT_RAWMTRL_NM>
<RAWMTRL_NCKNM/>
<ENG_NM>Yellow star apple, Caimito, Caimo, Luma</ENG_NM>
<SCNM>Pouteria caimito Radlk / Lucuma caimito Roem. &amp; Schult / Achras caimito Ruiz &amp; Pavon</SCNM>
<REGN_CD_NM>열매</REGN_CD_NM>
<RAWMTRL_STATS_CD_NM/>
<USE_CND_NM>사용가능부위 : 열매</USE_CND_NM>
</item>
</items>
</body>
</response>
*/

/*
HACCP result example
{"totalCount":"9","pageNo":"1","resultCode":"OK","list":[{"nutrient":"영양성분 1회 제공량 1봉지(21.5g) 총 14회 제공량(301g), 1회 제공량 당 함량 *%영양성분 기준치, 열량 92 kcal, 탄수화물 14g 4%, 당류 6g, 단백질 0.9g 2%, 지방 3.6g 7%, 포화지방 1.2g 8%, 트랜스지방 0g, 콜레스테롤 2mg 1%, 나트륨 62mg 3% *%영양성분 기준치:1일 영양성분 기준치에 대한 비율","rawmtrl":"밀가루(미국산,호주산),물엿,백설탕,마가린{팜유(말레이시아산),에스테르화유(팜스테아린유:말레이시아산,야자유:인도네시아산),팜핵경화유,팜올레인유,팜올레인부분경화유,유화제),초콜릿-CW[백설탕,가공유지(팜핵경화에스테르화유:말레이시아산),혼합분유(네덜란드산),코코아분말(싱가포르산),헤이즐넛스프레드위드코코아,코코아매스(싱가포르산),유화제],액상과당,전분,D-소르비톨액,전란액,식물성크림류,찹쌀(국산)1%,트레할로스,정제염,산도조절제,혼합제제(정제수,과당,유화제,프로필렌글리콜,주정,폴리소르베이트60),혼합제제(전분,글리세린지방산에스테르,구연산삼나트륨,말토게닉아밀라아제),혼합제제(산도조절제,유화제,정제수)*코코아원료 1.5% 함유","prdlstNm":"초코파이찰떡","imgurl2":"http://fresh.haccp.or.kr/prdimg/1990/1990037704262/1990037704262-2.jpg","barcode":"8801204203028","imgurl1":"http://fresh.haccp.or.kr/prdimg/1990/1990037704262/1990037704262-1.jpg","productGb":"식품","seller":"㈜청우식품/경기도 가평군 가평읍 연갈길 124-10","prdkindstate":"알수없음","rnum":"1","manufacture":"㈜청우식품/경기도 가평군 가평읍 연갈길 124-10","prdkind":"초콜릿가공품","capacity":"301g","prdlstReportNo":"1990037704262","allergy":"밀,우유,대두,계란 함유"},{"nutrient":"영양성분 1회 제공량:1봉지(37g)  총 12회 제공량(444g), 1회 제공량당 함량 : 열량 168 kcal, 탄수화물 22g(7%)\u2022 당류 13g, 단백질 2g(4%), 지방 8g(16%) \u2022 포화지방 4.8g(32%) \u2022 트랜스지방 0g, 콜레스테롤 5mg(2%), 나트륨 75mg(4%) *()안의 수치는 1일 영양성분 기준치에 대한 비율","rawmtrl":"백설탕, 밀가루(밀 미국산), 물엿, 쇼트닝(팜유 말레이시아산, 팜올레인유 말레이시아산), 식물성유지 말레이시아산, 전지분유, 코코아 프리퍼레이션, 유당, 전란액, 코코아분말, 말차분말, 젤라틴(돼지), 포도당, 식물성유지, 식염, 혼합제제(변성전분, 백설탕, 말토덱스트린, 산도조절제, 코코아매스, 난백분, 혼합제제(유화제,산도조절제,아라비아검), 합성착향료(바닐린,밀크향,말차향), 심황색소, 잔탄검, 유화제, 콜라겐, 치자청색소 \u2022 특정성분함량: 코코아원료 2.9%","prdlstNm":"초코파이 정 말차라떼","imgurl2":"http://fresh.haccp.or.kr/prdimg/1987/19870415003287/19870415003287-2.jpg","barcode":"8801117547318","imgurl1":"http://fresh.haccp.or.kr/prdimg/1987/19870415003287/19870415003287-1.jpg","productGb":"식품","seller":"알수없음","prdkindstate":"알수없음","rnum":"2","manufacture":"㈜오리온 제4청주공장 충청북도 청주시 흥덕구 월명로 249","prdkind":"초콜릿가공품","capacity":"444g","prdlstReportNo":"19870415003287","allergy":"계란,밀,우유,대두,쇠고기,돼지고기 함유"},{"nutrient":"영양정보 총 내용량 444 g(37 g × 12봉지) 1봉지(37 g)당 173 kcal, 나트륨 45mg 2%, 탄수화물 21g 6%, 당류 14g 14%, 지방 9g 17%, 트랜스지방 0g, 포화지방 6g 40%, 콜레스테롤 10mg 3%, 단백질 2g 4%,  1일 영양성분 기준치에 대한 비율(%)은 2,000 kcal 기준이므로 개인의 필요 열량에 따라 다를 수 있습니다.","rawmtrl":"백설탕,밀가루(밀 미국산),물엿,쇼트닝(팜유 말레이시아산,팜올레인유 말레이시아산),식물성유지(말레이시아산),전지분유,전란액,유당,코코아프리퍼레이션,바나나퓨레(필리핀산),코코아분말,식물성유지,포도당,젤라틴(돼지),혼합제제(변성전분,백설탕,말토덱스트린),코코아매스,산도조절제,식염,바나나플레이크(에콰도르산),합성향료(바닐린,밀크향,바나나향),밀크버드,심황색소,혼합제제(유화제,산도조절제,아라비아검),잔탄검,유화제,홍국색소","prdlstNm":"초코파이 정 바나나맛","imgurl2":"http://fresh.haccp.or.kr/prdimg/1987/19870415003271/19870415003271-2.jpg","barcode":"8801117545017","imgurl1":"http://fresh.haccp.or.kr/prdimg/1987/19870415003271/19870415003271-1.jpg","productGb":"식품","seller":"알수없음","prdkindstate":"알수없음","rnum":"3","manufacture":"㈜오리온 제4청주공장 충청북도 청주시 흥덕구 월명로 249","prdkind":"초콜릿가공품","capacity":"444g","prdlstReportNo":"19870415003271","allergy":"계란, 밀, 우유, 대두, 쇠고기, 돼지고기 함유"},{"nutrient":"영양정보 총 내용량 468 g(39 g × 12봉지) 1봉지(39 g)당 171 kcal, 나트륨 90mg 5%, 탄수화물 25g 8%, 당류 14g 14%, 지방 7g 13%, 트랜스지방 0g, 포화지방4.1g 27%, 콜레스테롤 0mg 0%, 단백질 2g 4%,  1일 영양성분 기준치에 대한 비율(%)은 2,000 kcal 기준이므로 개인의 필요 열량에 따라 다를 수 있습니다.","rawmtrl":"밀가루(밀 미국산),백설탕,물엿,쇼트닝(팜유 말레이시아산,팜올레인유 말레이시아산),식물성유지(말레이시아산),코코아프리퍼레이션,코코아분말,산도조절제,포도당,젤라틴(돼지),전란액,식염,코코아매스,합성향료(바닐린,바닐라향분말),혼합제제(유화제,산도조절제,아라비아검),잔탄검,유화제","prdlstNm":"초코파이","imgurl2":"http://fresh.haccp.or.kr/prdimg/1987/19870415003114/19870415003114-2.jpg","barcode":"880117534912","imgurl1":"http://fresh.haccp.or.kr/prdimg/1987/19870415003114/19870415003114-1.jpg","productGb":"식품","seller":"알수없음","prdkindstate":"알수없음","rnum":"4","manufacture":"㈜오리온 제4청주공장 충청북도 청주시 흥덕구 월명로 249","prdkind":"초콜릿가공품","capacity":"468g","prdlstReportNo":"19870415003114","allergy":"계란, 밀, 우유, 대두, 쇠고기, 돼지고기 함유"},{"nutrient":"1회 제공량 2봉지(39g) 총 약3회 제공량(116g) 1회 제공량 함량 *%영양소 기준치 열량 180kcal, 탄수화물 21g 6%,당류 12g, 단백질 3g 5%,지방 9g 18%, 포화지방 4.4g 29%,트랜스지방 0.5g미만,콜레스테롤 20mg 7%,나트륨 140mg 7% *%영양소기준치:1일 영양소기준치에 대한 비율","rawmtrl":"무농약밀가루(밀/국산)25%,준초콜릿[백설탕,가공유지(말레이지아산),혼합분유(벨기에산/전지분유(우유),코코아파우더),유당,코코아분말,코코아매스,유화제(레시틴(대두),글리세린지방산에스테르),정제염,천연착향료(바닐라엑기스)]22%함유,유기농설탕16%,명인유기쌀조청[유기쌀98.5%(국산),엿기름(국산),효소]15%,쇼트닝9%,홀란액[계란(국산),무항생제)8%,젤라틴(돼지고기),프락토올리고당,가공전지분-2(우유),가공버터,발효주정,레시틴(대두),탄산수소나트륨,탄산수소암모늄,구운소금(국산),천연착향료(바닐라향),혼합제제(젖산,자몽종자추출물,파이오렌,글리세린지방산에스테르,글리세린,타우린)","prdlstNm":"맘스케어미니초코파이","imgurl2":"http://fresh.haccp.or.kr/prdimg/1982/19820481021208/19820481021208-2.jpg","barcode":"알수없음","imgurl1":"http://fresh.haccp.or.kr/prdimg/1982/19820481021208/19820481021208-1.jpg","productGb":"식품","seller":"프로엠 트레이딩/서울시 송파구 송파대로 260","prdkindstate":"알수없음","rnum":"5","manufacture":"훼미리식품㈜/전북 전주시 시덕진구 팔과정로 216","prdkind":"초콜릿가공품","capacity":"116g(540kcal)/6봉입","prdlstReportNo":"19820481021208","allergy":"알수없음"},{"nutrient":"1회 제공량 1봉(37G) 총 12회 제공량(444G) 1회 제공량당 함량:열량 160KCAL, 탄수화물 24G(7%), 당류 14G, 단백질 2G(4%), 지방 6G 12%, 포화지방 4.2G 28%, 콜레스테롤 10MG 3%, 나트륨 75MG(4%) \u203b()안의 수치는 1일 영양소기준치에 대한 비율임","rawmtrl":"밀가루(밀:미국산),물엿,쇼트닝(정제가공유지(부분경화유:팜스테아린유(말레이시아산),우지(호주산),식물성유지(부분경화유(말레이시아산),팜유,팜핵유),전란액,혼합분유,코코아분말(인도네시아산),소르비톨액,글리세린,주정0.52%,기타가공품,가공연유,분말,결정포도당,유당,젤라틴,산도조절제,정제소금,난백분,합성착향료(녹차향,밀크향,바닐라향,바닐린),홍화황색소,유화제,코코아매스(가나산:코코아빈),가루녹차(제주산),치자황색소","prdlstNm":"초코파이 녹차","imgurl2":"http://fresh.haccp.or.kr/prdimg/1978/19780614009428/19780614009428-2.jpg","barcode":"알수없음","imgurl1":"http://fresh.haccp.or.kr/prdimg/1978/19780614009428/19780614009428-1.jpg","productGb":"식품","seller":"알수없음","prdkindstate":"알수없음","rnum":"6","manufacture":"롯데제과㈜/경남 양산시 양산대로 1158","prdkind":"초콜릿가공품","capacity":"444g","prdlstReportNo":"19780614009428","allergy":"알수없음"},{"nutrient":"1회 제공량 1봉(38g) 총 33회 제공량(1,254g) 1회 제공량당 함량 *%영양성분 기준치 열량 170kcal, 탄수화물 24g 7%, 당류 12g, 단백질 2g 4%, 지방 7g 14%, 포화지방 4.3g 29%, 트랜스지방 0g, 콜레스테롤 0mg 0%, 나트륨 85mg 4% *%영양성분 기준치:1일 영양성분 기준치에 대한 비율","rawmtrl":"밀가루(밀:미국산),백설탕,물엿,식물성유지(싱가포르산),쇼트닝(말레이시아산),덱스트린,혼합분유Ⅰ,코코아분말(싱가포르산),쌀가루(국산),D-소르비톨액,글리세린,혼합분유Ⅱ,산도조절제,전란액,코코아매스(가나산;코코아빈),주정0.56%,분말·결정포도당,젤라틴,정제소금,레시틴,유화제,합성착향료(바닐린,바닐라향),혼합제제(유화제,아라비아검,산도조절제),잔탄검","prdlstNm":"통큰 초코파이","imgurl2":"http://fresh.haccp.or.kr/prdimg/1978/19780614009363/19780614009363-2.jpg","barcode":"알수없음","imgurl1":"http://fresh.haccp.or.kr/prdimg/1978/19780614009363/19780614009363-1.jpg","productGb":"식품","seller":"롯데쇼핑㈜/서울특별시 중구 남대문로 81(소공동)","prdkindstate":"알수없음","rnum":"7","manufacture":"롯데제과주식회사/경남 양산시 양산대로 1158","prdkind":"초콜릿가공품","capacity":"1,254g","prdlstReportNo":"19780614009363","allergy":"밀,우유,대두,계란,돼지고기 함유"},{"nutrient":"1회 제공량(32g) 총 12회 제공량(384g) 1회 제공량당 함량 *%영양소기준치 열량 140kcal, 탄수화물 20g 6%, 당류 12g, 단백질 1g 2%, 지방 6g 12%, 포화지방 3.6g 24%, 트랜스지방 0g, 콜레스테롤 0mg 0%, 나트륨 95mg 5% *%영양소기준치:1일 영양소기준치에 대한 비율","rawmtrl":"밀가루(밀·미국산),백설탕,물엿,쇼트닝[가공유지(팜스테아린유(말레이시아산),대두(수입산)),팜유(말레이시아산);부분경화유],코코아버터(말레이시아산),D-소르비톨액,유화제(대두),전지분골드Ⅰ,합성착향료(바닐린,바닐라향,초콜릿향),혼합제제(유화제,아라비아검,산도조절제),산탄검(계피분말)","prdlstNm":"가나 리얼 초코파이 카카오","imgurl2":"http://fresh.haccp.or.kr/prdimg/1978/19780614009304/19780614009304-2.jpg","barcode":"8801062637157","imgurl1":"http://fresh.haccp.or.kr/prdimg/1978/19780614009304/19780614009304-1.jpg","productGb":"식품","seller":"알수없음","prdkindstate":"알수없음","rnum":"8","manufacture":"롯데제과주식회사 경남 양산시 양산대로 1158","prdkind":"초콜릿가공품","capacity":"384g","prdlstReportNo":"19780614009304","allergy":"알수없음"},{"nutrient":"총 내용량 420g(35g×12봉) 1봉(35g)당 150kcal 나트륨 80mg 4%, 탄수화물 23g 7%, 당류 13g 13%, 지방 6g 11%, 트랜스지방 0.2g미만, 포화지방 4g 27%, 콜레스테롤 2mg미만 1%, 단백질 1g 2% 1일 영양성분 기준치에 대한 비율(%)은 2,000kcal 기준이므로 개인의 필요 열량에 따라 다를 수 있습니다","rawmtrl":"밀가루(밀:미국산),설탕,물엿,쇼트닝(가공유지(부분경화유:팜스테아린유(말레이시아산)),동물성유지(호주산)),식물성유지(부분경화유(말레이시아산):팜유,팜핵유),혼합분유,코코아분말(인도네시아산),D-소르비톨액,글리세린,전란액,유당,기타가공품,주정0.727%(알코올함량95%),포도당,젤라틴,산도조절제,정제소금,코코아매스(코코아빈:가나산),유화제,혼합제제(유화제,아라비아검,산도조절제),잔탄검,합성향료(바닐라향,바닐린)","prdlstNm":"LOTTE 초코파이","imgurl2":"http://fresh.haccp.or.kr/prdimg/1978/197806140093/197806140093-2.jpg","barcode":"8801062634163","imgurl1":"http://fresh.haccp.or.kr/prdimg/1978/197806140093/197806140093-1.jpg","productGb":"식품","seller":"롯데제과㈜경남 양산시 양산대로 1158","prdkindstate":"알수없음","rnum":"9","manufacture":"롯데제과㈜경남 양산시 양산대로 1158","prdkind":"초콜릿가공품","capacity":"420g","prdlstReportNo":"197806140093","allergy":"밀,대두,우유,계란,돼지고기,쇠고기 함유"}],"resultMessage":"success","numOfRows":"10"}
*/

/*
foodlist sample
http://openapi.foodsafetykorea.go.kr/api/sample/C002/xml/1/5
*/