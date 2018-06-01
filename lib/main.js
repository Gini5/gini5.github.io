var HttpRequest = require("nebulas").HttpRequest;
var Neb = require("nebulas").Neb;
var Account = require("nebulas").Account;
var neb = new Neb();
var NebPay = require("nebpay");
var nebPay = new NebPay();

//handle link click
$("#findLink").click(function(){
    $("#btnGeneratePW").hide();
    $("#btnGetPW").show();
    $("#findTab").addClass("active");
    $("#generateTab").removeClass("active");
});

$("#generateTab").click(function(){
    $("#btnGeneratePW").show();
    $("#btnGetPW").hide();
    $("#findTab").removeClass("active");
    $("#generateTab").addClass("active");
});

//test net
neb.setRequest(new HttpRequest("https://testnet.nebulas.io"));
var dappAdress = "n1osXdcP8XgcDNgTC1x1N4fYv6XsYuTacgU"; //hash:e4aabd22c835d9a81948dc679b7d2574b8362f5d3354ee5d330e26fd624abe90
// var dappAdress="n1i1ByEBrwqrsnLVDZuc41jiWMABkBojtQz"; //hash:5ffbc336a7cd74f1aca32da48dcef608074051112f00e200cebc7cc23b63f9e0

//main net
// neb.setRequest(new HttpRequest("https://mainnet.nebulas.io"));
// var dappAdress="";

var sOrigin;
$("#btnGetPW").click(function(){
    sOrigin = $("#original").val();
    // getPW(sOrigin);
    getPW(sOrigin).then(function(resp){
        var result = resp.result;
        if(result && result !== "null"){   //no existing string, call generate function
            $('#generated').val(JSON.parse(result).pw);
            }
            else{
                alert("找不到该字符串。");
            }
    });
    
});

$("#btnGeneratePW").click(function(){
    sOrigin = $("#original").val();
    getPW(sOrigin).then(function(resp){
        var result = resp.result;
        if(!result || result === "null"){   //no existing string, call generate function
            generatePW(sOrigin);
        }
        else{   //string has been used, pop up warning
            alert(`该字符串已被占用，请输入一个新的。`)
        }
    });
});



function getPW(sOrigin){
    // var value = "0";
    // var callFunction = "getPW";
    // var callArgs = JSON.stringify([sOrigin]); //in the form of ["args"]
    // nebPay.simulateCall(dappAdress, value, callFunction, callArgs, {    //使用nebpay的simulateCall接口去执行get查询, 模拟执行.不发送交易,不上链
    //     listener: cbGet      //指定回调函数
    // });
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
    // neb.api.call(from,dappAdress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
    //         cbGet(resp)
    //     }).catch(function (err) {
    //         console.log("error:" + err.message)
    //     })
    return neb.api.call(from, dappAdress, value, nonce, gas_price, gas_limit, contract);
}

// function cbGet(resp){
//     var result = resp.result;
//     console.log("return of rpc call: " + JSON.stringify(result));
//     if(result && result !== "null"){   //no existing string, call generate function
//         $('#generated').val(result.pw);
//     }
//     else{
//         alert("找不到该字符串。");
//     }
// }

function generatePW(sOrigin){
    generate(sOrigin,function (data) {
        if (data.status == 0) {
            $('#generated').val(data.pw);
        } else {
            console.log(data)
        }
    })
}

function generate(sOrigin,callback) {
    var _call = callback || $.noop;
    var callArgs = JSON.stringify([sOrigin]);

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
                        }, 1000)
                    }
                }
            });
        }
    }
    var serialNumber = nebPay.call(dappAdress, 0, "generatePW", callArgs, {
        listener: _listener
    });
}