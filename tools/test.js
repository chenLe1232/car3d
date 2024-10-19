var aa = {
    format: function (e) {
        for (var t = 0, i = Math.round(e); i > 500 && t < 30;) t++ , i /= 1e3;
        for (; i > 0 && i < 1 && t > 0;) t-- , i *= 1e3;
        // return goldCountText;
        console.log(e,i,t);
    },
    logGoldUnit2Array: function () {
        cc.log("GoldUnit-> ", n);
        for (var e = [], t = 0; t < 30; t++) {
            var i = n[t];
            e.push(i);
        }
        cc.log("GoldUnit-> ", JSON.stringify(e));
    }
}

aa.format(1230000);