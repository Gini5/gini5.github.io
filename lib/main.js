var HttpRequest = require("nebulas").HttpRequest;
var Neb = require("nebulas").Neb;
var Account = require("nebulas").Account;
var neb = new Neb();
var NebPay = require("nebpay");
var nebPay = new NebPay();

//handle link click
$("#findLink").click(function(){
    $("#generateLink").removeClass("active");
    $("#findLink").addClass("active");
    $("#generateSection").hide();
    $("#findSection").show();
});

$("#generateLink").click(function(){
    $("#findLink").removeClass("active");
    $("#generateLink").addClass("active");
    $("#findSection").hide();
    $("#generateSection").show();
});

//test net
// neb.setRequest(new HttpRequest("https://testnet.nebulas.io"));
// var dappAdress = "n1ek7abbUGj9zzgkNCkSWW2yYFCJXwFeD2x"; //hash:655cb69c4b06697b16f9fcb3e1f5926af047e591ebeed2fcca972b844ed4048f
//main net
neb.setRequest(new HttpRequest("https://mainnet.nebulas.io"));
var dappAdress="n1vUeA9a8GhyTQj6b9NpBcinKHpn2yatroz";    //hash: d15077710ee91ad7aa9ffd2fdeaf316c34b4c5a5d0c4e93ce1bc738051f640a5

var sOrigin, sLength;
$("#btnGetPW").click(function(){
    var oNotExistWarning = $('#notExistWarning');
    var oOriginalElement = document.getElementById("originalFind");
    oNotExistWarning.hide();
    sOrigin = $("#originalFind").val();
    sLength = $("#length").val();
    if(sOrigin === ""){
        oOriginalElement.style.borderColor = "red";
    }
    else{
        oOriginalElement.style.borderColor = "";
        $("#modalProgress").modal("show");
        getPW(sOrigin).then(function(resp){
            $("#modalProgress").modal("hide");
            var result = resp.result;
            if(result && result !== "null"){   //no existing string, call generate function
                $('#resultFind').val(JSON.parse(result).pw);
                }
                else{
                    oNotExistWarning.show();
                }
        });
    }
});

$("#btnGeneratePW").click(function(){
    var oExistWarning = $('#existWarning');
    var oOriginalElement = document.getElementById("originalGenerate");
    oExistWarning.hide();
    sOrigin = $("#originalGenerate").val();
    sLength = $("#length").val();
    if(sOrigin === ""){
        oOriginalElement.style.borderColor = "red";
    }
    else{
        oOriginalElement.style.borderColor = "";
        // $("#modalProgress").modal("show");
        getPW(sOrigin).then(function(resp){
            // $("#modalProgress").modal("hide");
            var result = resp.result;
            if(!result || result === "null"){   //no existing string, call generate function
                generatePW(sOrigin);
            }
            else{   //string has been used, pop up warning
                oExistWarning.show();
            }
        });
    }
    
});

$("#btnCopyGenerate").click(function(){copy("resultGenerate")});
$("#btnCopyFind").click(function(){copy("resultFind")});

function getPW(sOrigin){
	var from = Account.NewAccount().getAddressString();
    var value = "0";
    var nonce = "0"
    var gas_price = "1000000"
    var gas_limit = "2000000"
    var callFunction = "getPW";
    var callArgs = JSON.stringify([sOrigin]);
    var contract = {
        "function": callFunction,
        "args": callArgs
    }
    return neb.api.call(from, dappAdress, value, nonce, gas_price, gas_limit, contract);
}

function generatePW(sOrigin){
    generate(sOrigin,function (data) {
        if (data.status == 0) {
            // $("#modalProgress").modal("hide");
            $('#resultGenerate').val(data.pw);
        } else {
            console.log(data)
        }
    })
}

function generate(sOrigin,callback) {
    var _call = callback || $.noop;
    var callArgs = JSON.stringify([sOrigin,sLength]);

    var _loopCall = null;
    var _loopCount = 0;
    var _listener = function (rep) {
        // debugger;
        console.log(rep)
        _loopCount++;
        if (typeof rep == "string" && rep.indexOf("Error") != -1) {
            clearTimeout(_loopCall)
        } else {
            neb.api.getTransactionReceipt({
                hash: rep.txhash
            }).then(function (receipt) {
                if (receipt.status === 1) {
                    // 交易成功
                    _call.call(this, JSON.parse(receipt.execute_result))
                } else {
                    if (_loopCount >= 60) {
                        alert("交易失败，请刷新后重试")
                    } else {
                        _loopCall = setTimeout(function(){
                            _listener(rep)
                        }, 5000)
                    }
                }
            });
        }
    }
    var serialNumber = nebPay.call(dappAdress, 0, "generatePW", callArgs, {
        listener: _listener
    });
}

function copy(sElementId){
    document.getElementById(sElementId).select();
    var bSuccessful = document.execCommand("copy");
}