Math.add = function(x, y) {
    return x + y;
};

function Product(name, commission, transform) {
    var bets = {};

    // parseInt returns NaN for anything "bad",
    //   any numeric comparison with NaN returns false which is useful
    this.bet = function(pick, amount) {
        amount = parseInt(amount);
        if (!(amount > 0)) {
            return false;
        }

        if (!(pick in bets)) {
            bets[pick] = [];
        }

        bets[pick].push(amount);
        return true;
    };

    this.calculateTotal = function() {
        return Object.keys(bets)
            .reduce(function(x, y) { return x.concat(bets[y]); }, []) // reduce nested arrays to a single array
            .reduce(Math.add, 0);
    };

    this.calculateDividends = function(places) {
        var self = this;

        // transform winning places into array of winners relevant to this product..
        //   filter the winners by those that were actually picked..
        //   map those registered winning picks to a tuple of [pick, dividend]
        //     where dividend is: (1 - commission) * total bets in this product..
        //       divided by the sum of the winning bets..
        //       further divided by the number of winning pools

        return transform(places)
            .filter(function(p) { return p in bets; })
            .map(function(b) {
                return [b, (1 - commission) * self.calculateTotal()
                    / bets[b].reduce(Math.add, 0)
                    / transform(places).length];
            });
    };

    this.getName = function() {
        return name;
    };
}

// Product.transform functions turn the winner list into the winners relevant to product type
Product.transform = {
    WIN     : function(places) { return places.slice(0, 1); },
    PLACE   : function(places) { return places; },
    EXACTA  : function(places) { return [places.slice(0, 2).join(',')]; }
};

function ProductHandler() {
    var products = {};

    this.registerProduct = function(key, product) {
        products[key] = product;
    };

    this.registerBet = function(product, pick, amount) {
        if (!(product in products)) { return false; }
        return products[product].bet(pick, amount);
    };

    // for each product, concatenate the calculated dividends
    //   where the dividends themselves are mapped to a tuple of [product name, winning pick, dividend]
    this.calculateDividends = function(places) {
        return Object.keys(products).reduce(function(c, p) {
            return c.concat(products[p].calculateDividends(places).map(function(d) {
                return [products[p].getName()].concat(d);
            }));
        }, []);
    };
}

module.exports = {
    ProductHandler  : ProductHandler,
    Product         : Product,
    Math            : Math
};
