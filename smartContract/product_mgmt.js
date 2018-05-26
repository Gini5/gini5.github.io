"use strict";

var ProductItem = function (text) {
	if (text) {
		var obj = JSON.parse(text);
		this.name = obj.name;
		this.price = obj.price;
		this.description = obj.description;
	} else {
	    this.name = "";
		this.price = new BigNumber(0);
		this.description = "";
	}
};

ProductItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var Products = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new ProductItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

Products.prototype = {
	init: function(){

	},

    get: function (name) {
        name = name.trim();
        if(name){
        	return this.repo.get(name);
        }
    },

    save: function (name, description, price) {
        name = name.trim();
        description = description.trim();
        try{
        	price = parseFloat(price);
        }
        catch(err){
        	throw new Error("Parse price fail!");
        }
        if(!name || !price){
        	throw new Error("Undefined Name/Price");
        }
        if (name.length > 64){
            throw new Error("name exceed limit length")
        }

        var prodItem = this.repo.get(name);
        if (prodItem){
            throw new Error("Name has been occupied");
        }

        prodItem = new ProductItem();
        prodItem.name = name;
        prodItem.price = price;
        prodItem.description = description;

        this.repo.put(name, prodItem);
    }
};
module.exports = Products;