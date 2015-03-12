var tabcorp = require('./lib.js');

exports.testProduct = {
    setUp: function(cb) {
        this.product = new tabcorp.Product('Product1');
        cb();
    },
    testRegisterGoodBet: function(test) {
        test.ok(this.product.bet('1'    , 50));
        test.ok(this.product.bet('12,23', 1));
        test.ok(this.product.bet('2'    , 1.01));
        test.ok(this.product.bet('2'    , 10));
        test.ok(this.product.bet('2'    , '85'));
        test.done();
    },
    testRegisterBadBet: {
        testZeroAmount: function(test) {
            test.ok(!this.product.bet('2', 0));
            test.done();
        },
        testNegativeAmount: function(test) {
            test.ok(!this.product.bet('2', -10));
            test.done();
        },
        testNonAlphaNumericAmount: function(test) {
            test.ok(!this.product.bet('2', '.'));
            test.done();
        },
        testNaNAmount: function(test) {
            test.ok(!this.product.bet('2', NaN));
            test.done();
        },
        testArrayAmount: function(test) {
            test.ok(!this.product.bet('3', []));
            test.done();
        },
        testObjectAmount: function(test) {
            test.ok(!this.product.bet('4', {}));
            test.done();
        },
        testNullAmount: function(test) {
            test.ok(!this.product.bet('4', null));
            test.done();
        },
        testUndefinedAmount: function(test) {
            test.ok(!this.product.bet('4', undefined));
            test.done();
        }
    }
};

exports.testProductCalculations = {
    testTotals: {
        setUp: function(cb) {
            this.product = new tabcorp.Product;
            cb();
        },
        testEmpty: function(test) {
            test.equals(this.product.calculateTotal(), 0);
            test.done();
        },
        testOneBet: function(test) {
            this.product.bet('1', 42);

            test.equals(this.product.calculateTotal(), 42);
            test.done();
        },
        testMultipleBetsSinglePick: function(test) {
                this.product.bet('1', 42);
                this.product.bet('1', 85);
                this.product.bet('1',  1);
                this.product.bet('1', 20);

            test.equals(this.product.calculateTotal(), 148);
            test.done();
        },
        testMultipleBetsMultiplePicks: function(test) {
                this.product.bet('1', 42);
                this.product.bet('1', 85);
                this.product.bet('1',  1);
                this.product.bet('1', 20);

                this.product.bet('2', 42);
                this.product.bet('3', 67);
                this.product.bet('7',  4);

            test.equals(this.product.calculateTotal(), 261);
            test.done();
        }
    },
    testTransforms: {
        testWinTransform: function(test) {
            test.deepEqual(tabcorp.Product.transform.WIN([1, 2, 3]), [1]);
            test.deepEqual(tabcorp.Product.transform.WIN([1]), [1]);
            test.done();
        },
        testPlaceTransform: function(test) {
            test.deepEqual(tabcorp.Product.transform.PLACE([1, 2, 3]), [1, 2, 3]);
            test.deepEqual(tabcorp.Product.transform.PLACE([3, 2, 1]), [3, 2, 1]);
            test.deepEqual(tabcorp.Product.transform.PLACE([1]), [1]);
            test.done();
        },
        testExactaTransform: function(test) {
            test.deepEqual(tabcorp.Product.transform.EXACTA([1, 2, 3]), ['1,2']);
            test.deepEqual(tabcorp.Product.transform.EXACTA([2, 1, 3]), ['2,1']);
            test.deepEqual(tabcorp.Product.transform.EXACTA([1]), [1]);
            test.done();
        }
    },
    testDividends: {
        setUp: function(cb) {
            this.win    = new tabcorp.Product('win'     , 0.20, tabcorp.Product.transform.WIN);
            this.place  = new tabcorp.Product('place'   , 0.30, tabcorp.Product.transform.PLACE);
            this.exacta = new tabcorp.Product('exacta'  , 0.40, tabcorp.Product.transform.EXACTA);
            cb();
        },
        testEmpty: function(test) {
            test.deepEqual(this.win.calculateDividends([1, 2, 3])   , []);
            test.deepEqual(this.place.calculateDividends([1, 2, 3]) , []);
            test.deepEqual(this.exacta.calculateDividends([1, 2, 3]), []);
            test.done();
        },
        testOneBet: function(test) {
            this.win.bet('1', 10);
            this.place.bet('1', 10);
            this.exacta.bet('1,2', 10);

            test.equals(this.win.calculateDividends([1, 2, 3]).length, 1);
            test.deepEqual(this.win.calculateDividends([1, 2, 3]),
                [
                    [1, 0.8 * 10 / 10]
                ]);
            test.deepEqual(this.place.calculateDividends([1, 2, 3]),
                [
                    [1, 0.7 * 10 / 10 / 3]
                ]);
            test.deepEqual(this.exacta.calculateDividends([1, 2, 3]),
                [
                    ['1,2', 0.6 * 10 / 10]
                ]);
            test.done();
        },
        testNoWinningBet: function(test) {
            this.win.bet('1', 10);

            test.deepEqual(this.win.calculateDividends([3, 4, 5])   , []);
            test.deepEqual(this.place.calculateDividends([3, 4, 5]) , []);
            test.deepEqual(this.exacta.calculateDividends([3, 4, 5]), []);
            test.done();
        },
        testMultipleBetsProductWin: function(test) {
            this.win.bet('1', 10);
            this.win.bet('2', 10);
            this.win.bet('3', 10);
            this.win.bet('4', 10);

            test.equals(this.win.calculateDividends([1, 2, 3]).length, 1);
            test.deepEqual(this.win.calculateDividends([1, 2, 3])   , [[1, 0.8 * 40 / 10]]);
            test.done();
        },
        testMultipleBetsProductPlace: function(test) {
            this.place.bet('1', 10);

            this.place.bet('2', 10);
            this.place.bet('2', 10);

            this.place.bet('3', 10);
            this.place.bet('3', 10);
            this.place.bet('3', 10);

            this.place.bet('4', 10);
            this.place.bet('4', 10);
            this.place.bet('4', 10);
            this.place.bet('4', 10);

            test.equals(this.place.calculateDividends([1, 2, 3]).length, 3);
            test.deepEqual(this.place.calculateDividends([1, 2, 3]),
                [
                    [1, 0.7 * 100 / 10 / 3],
                    [2, 0.7 * 100 / 20 / 3],
                    [3, 0.7 * 100 / 30 / 3]
                ]);
            test.done();
        },
        testMultipleBetsExactaProduct: function(test) {
            this.exacta.bet('1,2', 10);
            this.exacta.bet('2,3', 10);
            this.exacta.bet('2,1', 10);

            test.equals(this.exacta.calculateDividends([1, 2, 3]).length, 1);
            test.deepEqual(this.exacta.calculateDividends([1, 2, 3]),
                [
                    ['1,2', 0.6 * 30 / 10]
                ]);
            test.done();
        }
    }
};
