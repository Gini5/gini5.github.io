"use strict";
var PWGenerator = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        stringify: function (obj) {
            return JSON.stringify(obj);
        },
        parse: function (str) {
            return JSON.parse(str);
        }
    });
};

PWGenerator.prototype = {
    init: function () {
        // todo
    },

    generatePW: function (key,length) {
        if (key === ""){
            throw new Error("empty key");
        }
        length = parseInt(length);
        if(length < 1){
            length = 8;
        }
        var pw = this._randomPassword(length);
        this.repo.put(key, {
            pw: pw,
            from: Blockchain.transaction.from
        });
        return {
            status: 0,
            pw: pw,
        }
    },

    getPW: function (key) {
        var res = this.repo.get(key);
        console.log("key:"+key+", pw:"+res);
        return res;
    },

    _randomPassword: function(size){
        var seed = new Array('A','B','C','D','E','F','G','H','I','J','K','L','M','N','P','Q','R','S','T','U','V','W','X','Y','Z',
        'a','b','c','d','e','f','g','h','i','j','k','m','n','p','Q','r','s','t','u','v','w','x','y','z',
        '2','3','4','5','6','7','8','9'
        );//数组
        var seedlength = seed.length;//数组长度
        var createPassword = '';
        for (var i=0;i<size;i++) {
            var j = Math.floor(Math.random()*seedlength);
        createPassword += seed[j];
        }
        return createPassword;
    }
};
module.exports = PWGenerator;