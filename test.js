var tabcorp = require('./lib.js');

exports.testMathAdd = function(test) {
    test.equal(tabcorp.Math.add(20, 5), 20 + 5);
    test.equal(tabcorp.Math.add(0, 0), 0);
    test.done();
};

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

exports.testProductHandler = {
    setUp: function(cb) {
        this.ph = new tabcorp.ProductHandler;
        cb();
    },
    testBetWithNoProducts: function(test) {
        test.ok(!this.ph.registerBet('non-existent', 'admire rakti', 100));
        test.done();
    },
    testBetOnNonExistentProduct: function(test) {
        this.ph.registerProduct('existent', new tabcorp.Product);
        test.ok(!this.ph.registerBet('non-existent', 'admire rakti', 100));
        test.done();
    },
    testEmptyDividends: function(test) {
        test.deepEqual(this.ph.calculateDividends([1, 2, 3]), []);
        test.done();
    }
};

exports.testProductHandlerBets = {
    setUp: function(cb) {
        this.ph = new tabcorp.ProductHandler;
        this.ph.registerProduct('W',
            new tabcorp.Product('Win', 0.15, tabcorp.Product.transform.WIN));
        this.ph.registerProduct('P',
            new tabcorp.Product('Place', 0.12, tabcorp.Product.transform.PLACE));
        this.ph.registerProduct('E',
            new tabcorp.Product('Exacta', 0.18, tabcorp.Product.transform.EXACTA));
        cb();
    },
    testGoodBet: function(test) {
        test.ok(this.ph.registerBet('W', 1, 100));
        test.done();
    },
    testBadAmount: function(test) {
        test.ok(!this.ph.registerBet('W', 1, 'hello'));
        test.ok(!this.ph.registerBet('W', 1, '0'));
        test.ok(!this.ph.registerBet('W', 1, 0));
        test.ok(!this.ph.registerBet('W', 1, -20));
        test.ok(!this.ph.registerBet('W', 1, 0.5));
        test.ok(!this.ph.registerBet('W', 1, NaN));
        test.ok(!this.ph.registerBet('W', 1, []));
        test.ok(!this.ph.registerBet('W', 1, {}));
        test.ok(!this.ph.registerBet('W', 1, undefined));
        test.ok(!this.ph.registerBet('W', 1, null));
        test.ok(!this.ph.registerBet('W', 1, function() {}));
        test.done();
    },
    testBadProduct: function(test) {
        test.ok(!this.ph.registerBet('Q', 1, 100));
        test.ok(!this.ph.registerBet('', 1, 100));
        test.ok(!this.ph.registerBet([], 1, 100));
        test.ok(!this.ph.registerBet({}, 1, 100));
        test.ok(!this.ph.registerBet(undefined, 1, 100));
        test.ok(!this.ph.registerBet(null, 1, 100));
        test.done();
    },
    testDividendsCalculation: function(test) {
        this.ph.registerBet('W', 1, 10);
        this.ph.registerBet('W', 2, 10);
        this.ph.registerBet('W', 3, 10);

        this.ph.registerBet('P', 1, 10);
        this.ph.registerBet('P', 2, 10);
        this.ph.registerBet('P', 2, 10);
        this.ph.registerBet('P', 3, 10);
        this.ph.registerBet('P', 3, 10);
        this.ph.registerBet('P', 3, 10);
        this.ph.registerBet('P', 4, 10);
        this.ph.registerBet('P', 4, 10);
        this.ph.registerBet('P', 4, 10);
        this.ph.registerBet('P', 4, 10);

        this.ph.registerBet('E', '1,2', 10);
        this.ph.registerBet('E', '1,2', 10);
        this.ph.registerBet('E', '1,3', 10);
        this.ph.registerBet('E', '2,3', 10);
        this.ph.registerBet('E', '3,1', 10);
        this.ph.registerBet('E', '2,1', 10);

        test.deepEqual(this.ph.calculateDividends([1, 2, 3]),
            [
                [ 'Win'     , 1, 0.85 * 30 / 10 ],
                [ 'Place'   , 1, 0.88 * 100 / 10 / 3 ],
                [ 'Place'   , 2, 0.88 * 100 / 20 / 3 ],
                [ 'Place'   , 3, 0.88 * 100 / 30 / 3 ],
                [ 'Exacta'  , '1,2', 0.82 * 60 / 20 ]
            ]);

        test.deepEqual(this.ph.calculateDividends([1, 3, 2]),
            [
                [ 'Win'     , 1, 0.85 * 30 / 10 ],
                [ 'Place'   , 1, 0.88 * 100 / 10 / 3 ],
                [ 'Place'   , 3, 0.88 * 100 / 30 / 3 ],
                [ 'Place'   , 2, 0.88 * 100 / 20 / 3 ],
                [ 'Exacta'  , '1,3', 0.82 * 60 / 10 ]
            ]);

        test.deepEqual(this.ph.calculateDividends([2, 1, 5]),
            [
                [ 'Win'     , 2, 0.85 * 30 / 10 ],
                [ 'Place'   , 2, 0.88 * 100 / 20 / 3 ],
                [ 'Place'   , 1, 0.88 * 100 / 10 / 3 ],
                [ 'Exacta'  , '2,1', 0.82 * 60 / 10 ]
            ]);

        test.deepEqual(this.ph.calculateDividends([7, 8, 9]), []);
        test.done();
    }
};
