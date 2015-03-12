Math.add = function(x, y) {
    return x + y;
};

function Product(name, commission, transform) {
    var bets = {};

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
            .reduce(function(x, y) { return x.concat(bets[y]); }, [])
            .reduce(Math.add, 0);
    };

    this.calculateDividends = function(places) {
        var self = this;
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
        amount = parseInt(amount);
        if (!(product in products && amount > 0)) { return false; }
        return products[product].bet(pick, amount);
    };

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
