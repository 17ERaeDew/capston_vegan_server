/* eslint-env es6 */
/* eslint-disable */
var express = require("express");
var router = express.Router();
var request = require("request");
let cheerio = require("cheerio");
var whichVegan = 0; // 0= 플렉시테리언 / 1=폴로/2=페스코/3=락토오보/4=오보/5=락토/6=비건(풀만 먹는 사람)
var seafood = 0;

function foodDB(res, name) {
  //원재료 표준코드API
  // https://www.data.go.kr/data/15058665/openapi.do
  var queryParams =
    "?" +
    encodeURIComponent("ServiceKey") +
    `=${precess.env.FOODDB_SERVICEKEY}`;
  queryParams +=
    "&" +
    encodeURIComponent("rprsnt_rawmtrl_nm") +
    "=" +
    encodeURIComponent(name);
  queryParams +=
    "&" + encodeURIComponent("numOfRows") + "=" + encodeURIComponent("1");
  request(
    {
      url: precess.env.FOODDB_URL + queryParams,
      method: "GET",
    },
    function (error, response, body) {
      $ = cheerio.load(body);
      $("item").each(function (idx) {
        let no1 = $(this).find("LCLAS_NM").text();
        let no2 = $(this).find("MLSFC_NM").text();
        if (no2 == 3) seafood = 1;
        //console.log(`대분류: ${no1}\n중분류: ${no2}`);
        if (no1 == " ") {
          foodlist(res, name);
        }
        return { no1, no2 };
      });
    },
  );
}

function foodlist(res, name) {
  //식품첨가물 원재료명API
  //https://www.foodsafetykorea.go.kr/api/openApiInfo.domenu_grp=MENU_GRP31&menu_no=661&show_cnt=10&start_idx=1&svc_no=C002
  var url = `http://openapi.foodsafetykorea.go.kr/api/${
    precess.env.FOODLIST_SERVICEKEY
  }/C002/JSON/1/1/PRDLST_NM=${encodeURIComponent(name)}`;
  request(
    {
      url: url,
      method: "GET",
    },
    function (error, response, body) {
      return res.json({ error: error, response: response, body: body });
    },
  );
}

function doRequest(url) {
  return new Promise(function (resolve, reject) {
    request(url, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        resolve(body);
      } else {
        reject(error);
      }
    });
  });
}

async function HACCP(res, name) {
  let data;
  //제품명API
  // https://www.data.go.kr/data/15058665/openapi.do
  var queryParams =
    "?" + encodeURIComponent("ServiceKey") + `=${precess.env.HACCP_SERVICEKEY}`;
  queryParams +=
    "&" + encodeURIComponent("prdlstNm") + "=" + encodeURIComponent(name);
  queryParams +=
    "&" + encodeURIComponent("returnType") + "=" + encodeURIComponent("xml");
  queryParams +=
    "&" + encodeURIComponent("numOfRows") + "=" + encodeURIComponent("20");
  try {
    data = await doRequest({ url: precess.env.HACCP_URL + queryParams });
  } catch (err) {
    return res.status(500).send();
  }
  let array = [];
  $ = cheerio.load(data);

  $("item").each((idx, ele) => {
    let na = $(ele).find("prdlstNm").text(); //대체식품명
    let no1 = $(ele).find("rawmtrl").text(); //대체식품 원재료
    let no2 = $(ele).find("prdkind").text(); //대체식품 유형
    let no3 = $(ele).find("imgurl1").text(); //대체식품 이미지
    // console.log(`제품명: ${na}\n 원재료: ${no1}\n유형: ${no2}\n, 사진: ${no3}`);

    array[idx] = { title: na, naturalName: no1, type: no2, cover: no3 };
  });
  return array;
}

router.use("/sendText", async (req, res) => {
  const { text, vegan } = req.body; //배열로 넘어옴
  console.log("sendText success : " + vegan);
  var vegan_text = text; // string text
  var a = text;
  var words = a.split(","); // 넘어온 텍스트 반점(,) 기준으로 나눠서 저장
  var rcmd = a.split(" "); // 대체식품 추천을 위해 필요
  var rcmdFood = "오류";
  var matching = false;
  var rcmdName = "오류";
  var notforVegan;

  // 넘어온 성분들 다 검색
  var size = words.length; // 배열 크기
  var i = 0;
  var j = 0;
  var k = 0;
  //var whichVegan = 0; // 0= 플렉시테리언 / 1=폴로/2=페스코/3=락토오보/4=오보/5=락토/6=비건(풀만 먹는 사람)
  var cmpVegan = vegan;
  var notforVegan = " ";
  vegan_text.replace(/(\s*)/g, "");

  while (i < size) {
    if (j == size - 1)
      // '함유' 제거하고 검색하기 위함
      words[j] = words[j].substring(0, words[j].indexOf(" ") - 1);

    if (words[j].indexOf("(") != -1) {
      foodDB(res, words[j].substring(0, words[j].indexOf("(") - 1));
    } else {
      foodDB(res, words[j]); // api 불러와서 하나씩 검색
    }
    j++;
    i++;
  }

  rcmd.forEach((value, index) => {
    if (value == "식품유형") {
      rcmdFood = rcmd[index + 1];
      return;
    }
    if (value == "식품의유형") {
      rcmdFood = rcmd[index + 1];
      return;
    }
  });
  rcmd.forEach((value, index) => {
    if (value == "제품명") {
      rcmdName = rcmd[index + 1];
      return;
    }
  });

  rcmdFood = rcmdFood.replace("류", "");
  rcmdFood = rcmdFood.replace("가공품", "");

  if (vegan == 6) {
    whichVegan = 6;
    if (cmpVegan <= whichVegan) matching = true;
    //forVegan = "플렉시테리언, 폴로 베지테리언, 페스코 베지테리언,락토오보 베지테리언,락토 베지테리언,비건";
    else matching = false; //forVegan = "비건";
    //forVegan = "비건";
    notforVegan = "돼지고기,쇠고기,닭고기,어육,계란,우유";
    const res_haccp = await HACCP(res, rcmdFood); //대체식품 추천
    // 대체식품 필터링;
    console.log("vegan");
    var tmp_array = res_haccp.filter((value, index) => {
      if (
        value.naturalName.indexOf("돼지고기") != -1 ||
        value.naturalName.indexOf("쇠고기") != -1 ||
        value.naturalName.indexOf("닭고기") != -1 ||
        value.naturalName.indexOf("어육") != -1 ||
        value.naturalName.indexOf("계란") != -1 ||
        value.naturalName.indexOf("우유") != -1
      );
      else return value;
    });

    return res.json({
      vegan: false,
      substitution: tmp_array,
      not_match: notforVegan,
      title: rcmdName,
      type: rcmdFood,
    });
  } else if (
    vegan_text.indexOf("돼지고기") != -1 ||
    vegan_text.indexOf("쇠고기") != -1
  ) {
    whichVegan = 0;
    if (cmpVegan == whichVegan) matching = true;
    else matching = false;
    forVegan = "플렉시테리언"; //에게 적합한 식품
    notforVegan = "";
    const res_haccp = await HACCP(res, rcmdFood); //대체식품 추천 (플렉시이므로 필터링 필요 X)
    // 대체식품 필터링

    return res.json({
      vegan: matching,
      substitution: res_haccp,
      not_match: notforVegan,
      title: rcmdName,
      type: rcmdFood,
    });
  } else if (vegan_text.indexOf("닭고기") != -1) {
    whichVegan = 1;
    if (cmpVegan <= whichVegan) matching = true;
    //forVegan = "플렉시테리언, 폴로 베지테리언";
    else matching = false; //forVegan = "폴로 베지테리언";
    notforVegan = "돼지고기,쇠고기";
    const res_haccp = await HACCP(res, rcmdFood); //대체식품 추천
    // 대체식품 필터링
    var tmp_array = res_haccp.filter((value, index) => {
      if (
        value.naturalName.indexOf("돼지고기") != -1 ||
        value.naturalName.indexOf("쇠고기") != -1
      );
      else return value;
    });
    return res.json({
      vegan: matching,
      substitution: tmp_array,

      not_match: notforVegan,
      title: rcmdName,
      type: rcmdFood,
    });
  } else if (seafood == 1 || vegan_text.indexOf("어육") != -1) {
    whichVegan = 2;
    if (cmpVegan <= whichVegan) matching = true;
    //forVegan = "플렉시테리언, 폴로 베지테리언, 페스코 베지테리언";
    else matching = false; //forVegan = "페스코 베지테리언";
    //forVegan = "페스코 베지테리언";
    notforVegan = "돼지고기,쇠고기,닭고기";
    const res_haccp = await HACCP(res, rcmdFood); //대체식품 추천
    // 대체식품 필터링
    var tmp_array = res_haccp.filter((value, index) => {
      if (
        value.naturalName.indexOf("돼지고기") != -1 ||
        value.naturalName.indexOf("쇠고기") != -1 ||
        value.naturalName.indexOf("닭고기") != -1
      );
      else return value;
    });
    return res.json({
      vegan: matching,
      substitution: tmp_array,

      not_match: notforVegan,
      title: rcmdName,
      type: rcmdFood,
    });
  } else if (vegan_text.indexOf("계란") != -1) {
    if (vegan_text.indexOf("우유") != -1) {
      whichVegan = 3;
      if (cmpVegan <= whichVegan) matching = true;
      //forVegan = "플렉시테리언, 폴로 베지테리언, 페스코 베지테리언,락토오보 베지테리언";
      else matching = false; //forVegan = "락토오보 베지테리언";
      //forVegan = "락토오보 베지테리언";
      notforVegan = "돼지고기,쇠고기,닭고기,어육";
      const res_haccp = await HACCP(res, rcmdFood); //대체식품 추천
      // 대체식품 필터링
      var tmp_array = res_haccp.filter((value, index) => {
        if (
          value.naturalName.indexOf("돼지고기") != -1 ||
          value.naturalName.indexOf("쇠고기") != -1 ||
          value.naturalName.indexOf("닭고기") != -1
        );
        else return value;
      });
      return res.json({
        vegan: matching,
        substitution: tmp_array,
        not_match: notforVegan,
        title: rcmdName,
        type: rcmdFood,
      });
    } else {
      whichVegan = 4;
      if (cmpVegan <= whichVegan) matching = true;
      //forVegan = "플렉시테리언, 폴로 베지테리언, 페스코 베지테리언,락토오보 베지테리언,오보 베지테리언";
      else matching = false; //forVegan = "오보 베지테리언";
      //forVegan = "오보 베지테리언";
      notforVegan = "돼지고기,쇠고기,닭고기,어육,우유";
      const res_haccp = await HACCP(res, rcmdFood); //대체식품 추천
      // 대체식품 필터링
      console.log("락토");
      var tmp_array = res_haccp.filter((value, index) => {
        if (
          value.naturalName.indexOf("돼지고기") != -1 ||
          value.naturalName.indexOf("쇠고기") != -1 ||
          value.naturalName.indexOf("닭고기") != -1 ||
          value.naturalName.indexOf("어육") != -1 ||
          value.naturalName.indexOf("우유") != -1
        );
        else return value;
      });
      return res.json({
        vegan: matching,
        substitution: tmp_array,
        not_match: notforVegan,
        title: rcmdName,
        type: rcmdFood,
      });
    }
  } else if (vegan_text.indexOf("우유") != -1) {
    whichVegan = 5;
    //r;
    if (cmpVegan <= whichVegan) matching = true;
    //forVegan = "플렉시테리언, 폴로 베지테리언, 페스코 베지테리언,락토오보 베지테리언,락토 베지테리언";
    else matching = false; //forVegan = "락토 베지테리언";
    //forVegan = "락토 베지테리언";
    notforVegan = "돼지고기,쇠고기,닭고기,어육,계란";
    const res_haccp = await HACCP(res, rcmdFood); //대체식품 추천
    // 대체식품 필터링
    var tmp_array = res_haccp.filter((value, index) => {
      if (
        value.naturalName.indexOf("돼지고기") != -1 ||
        value.naturalName.indexOf("쇠고기") != -1 ||
        value.naturalName.indexOf("닭고기") != -1 ||
        value.naturalName.indexOf("어육") != -1 ||
        value.naturalName.indexOf("계란") != -1
      );
      else return value;
    });
    return res.json({
      vegan: matching,
      substitution: tmp_array,
      not_match: notforVegan,
      title: rcmdName,
      type: rcmdFood,
    });
  } else {
    whichVegan = 6;
    if (cmpVegan <= whichVegan) matching = true;
    //forVegan = "플렉시테리언, 폴로 베지테리언, 페스코 베지테리언,락토오보 베지테리언,락토 베지테리언,비건";
    else matching = false; //forVegan = "비건";
    //forVegan = "비건";
    notforVegan = "돼지고기,쇠고기,닭고기,어육,계란,우유";
    const res_haccp = await HACCP(res, rcmdFood); //대체식품 추천
    // 대체식품 필터링;
    console.log("vegan");
    var tmp_array = res_haccp.filter((value, index) => {
      if (
        value.naturalName.indexOf("돼지고기") != -1 ||
        value.naturalName.indexOf("쇠고기") != -1 ||
        value.naturalName.indexOf("닭고기") != -1 ||
        value.naturalName.indexOf("어육") != -1 ||
        value.naturalName.indexOf("계란") != -1 ||
        value.naturalName.indexOf("우유") != -1
      );
      else return value;
    });

    return res.json({
      vegan: matching,
      substitution: tmp_array,
      not_match: notforVegan,
      title: rcmdName,
      type: rcmdFood,
    });
  }
});
module.exports = router;
