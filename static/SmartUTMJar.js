window.getCookie = function (name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
};

function isAdRelevantVisit() {
    return document.referrer.includes("google.com") || document.referrer.includes("bing.com") || location.search.includes("utm_source") || location.search.includes("gclid")
}

function visitedDate() {
    var d = new Date();
    return d.getUTCFullYear() + "-" + (d.getUTCMonth() + 1) + "-" + d.getUTCDate() + "T" + d.getUTCHours() + ":" + d.getUTCMinutes() + ":00Z";

}

function extractParameters() {
    var result = {};
    var tmp = null;
    location.search.substr(1).split("&").forEach(function (item) {
        tmp = item.split("=");
        result[tmp[0]] = decodeURIComponent(tmp[1]);
    });
    return result;
}

function extractCampaignParameters(params) {
    var result = {};
    Object.keys(params).forEach(function (key) {
        if (key === "utm_source" || key === "utm_medium" || key === "utm_campaign"
            || key === "utm_term" || key === "utm_content" || key === "gclid" || key === "utm_content" || key === "utm_term") {
            result[key] = params[key];
        }
    });
    if (Object.keys(result).length === 0) {

        if (document.referrer.includes("google.com")) {
            result = {"utm_source": "google", "utm_medium": "organic"};
        }
        else if (document.referrer.includes("bing.com")) {
            result = {"utm_source": "bing", "utm_medium": "organic"};
        }
        else {
            result = {"utm_source": "others", "utm_medium": "organic"};
        }
    }
    result.visit = visitedDate();
    result.referrer = document.referrer;
    result.landingPage = location.href.substr(0).split("?")[0];
    return result;
}

function writeCookieWithUTMParams(params) {
    var cookieValue = [params];
    if (document.cookie.indexOf("smartUTMJar=") >= 0) {
        lastCookieValue = JSON.parse(getCookie("smartUTMJar"));
        cookieValue = cookieValue.concat(lastCookieValue);
    }
    document.cookie = "smartUTMJar=".concat(JSON.stringify(cookieValue)).concat("; path=/; max-age=15552000; secure=true")
}

function fillFieldWithValue(fieldName, fieldValue) {
    try {
    var hf = document.getElementById(fieldName);
    if (!hf) {
        hf = document.getElementsByName(fieldName)[0];
    }
    if (hf) {
        hf.value = fieldValue || '';
    }
    }
    catch (e) {
        console.log("Did not find field " + fieldName + ". skipping...")
    }
}

function fillUTMJarField() {
    if (document.cookie.indexOf("smartUTMJar=") >= 0) {

        var cookie = JSON.parse(getCookie("smartUTMJar"));
        var utms = cookie[cookie.length - 1].utm_source;
        var utmm = cookie[cookie.length - 1].utm_medium;
        var gclid = cookie[cookie.length - 1].gclid;
        var utmc = cookie[cookie.length - 1].utm_campaign;
        var utmcontent = cookie[cookie.length - 1].utm_content;
        var utmterm = cookie[cookie.length - 1].utm_term;
        var firstVisitTime = cookie[cookie.length - 1].visit;
        var referrer = cookie[cookie.length - 1].referrer;
        var landingPage = cookie[cookie.length - 1].landingPage;

        fillFieldWithValue("smujarHistory", getCookie("smartUTMJar"));
        fillFieldWithValue("smujarFirstVisit", (utms || '') + (("-"+utmm) || '') + (("-"+gclid) || '') + (("-"+utmc) || '') + (("-"+utmcontent) || '') + (("-"+utmterm) || ''))
        fillFieldWithValue("smujarFirstVisitTime", firstVisitTime);

        fillFieldWithValue("smujarCurrentUTMSource", utms);
        fillFieldWithValue("smujarCurrentUTMMedium", utmm);
        fillFieldWithValue("smujarCurrentUTMCampaign", utmc);
        fillFieldWithValue("smujarCurrentUTMContent", utmcontent);
        fillFieldWithValue("smujarCurrentUTMTerm", utmterm);

        fillFieldWithValue("smujarCurrentLandingPage", landingPage);
        fillFieldWithValue("smujarCurrentReferrer", referrer);

        var first_utms = cookie[0].utm_source;
        var first_utmm = cookie[0].utm_medium;
        var first_utmc = cookie[0].utm_campaign;
        var first_utmcontent = cookie[0].utm_content;
        var first_utmterm = cookie[0].utm_term;
        var first_landingpage = cookie[0].landingPage;
        var first_referrer = cookie[0].referrer;

        fillFieldWithValue("smujarFirstUTMSource", first_utms);
        fillFieldWithValue("smujarFirstUTMMedium", first_utmm);
        fillFieldWithValue("smujarFirstUTMCampaign", first_utmc);
        fillFieldWithValue("smujarFirstUTMContent", first_utmcontent);
        fillFieldWithValue("smujarFirstUTMTerm", first_utmterm);

        fillFieldWithValue("smujarFirstLandingPage", first_landingpage);
        fillFieldWithValue("smujarFirstReferrer", first_referrer);
    }
}

function maintainLength() {

    if (document.cookie.indexOf("smartUTMJar=") >= 0) {
        lastCookieValue = JSON.parse(getCookie("smartUTMJar"));
        if (lastCookieValue.length > 20) {
            cookieValue= lastCookieValue.slice(lastCookieValue.length-1, lastCookieValue.length);
            document.cookie = "smartUTMJar=".concat(JSON.stringify(cookieValue))
        }
    }

}

function disableSmujarCookie() {
    document.cookie = "smartUTMJar=DoNotTrack";
    fillFieldWithValue("smujarHistory", "");
    fillFieldWithValue("smujarFirstVisit", "");
    fillFieldWithValue("smujarFirstVisitTime", "");

    fillFieldWithValue("smujarCurrentUTMSource", "");
    fillFieldWithValue("smujarCurrentUTMMedium", "");
    fillFieldWithValue("smujarCurrentUTMCampaing", "");
    fillFieldWithValue("smujarCurrentUTMContent", "");
    fillFieldWithValue("smujarCurrentUTMTerm", "");
}

function trackEnabled() {
    return getCookie("smartUTMJar") != "DoNotTrack";
}

function runSmartUTMJar() {
    if (isAdRelevantVisit() && trackEnabled()) {
        writeCookieWithUTMParams(extractCampaignParameters(extractParameters()));
    }
    if (trackEnabled()) {
    maintainLength();
    fillUTMJarField();
}
}

runSmartUTMJar();




