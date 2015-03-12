var split   = require('split');
var tabcorp = require('./lib.js');

// setup products
var ph = new tabcorp.ProductHandler;
    ph.registerProduct('W', new tabcorp.Product('Win'   , 0.15, tabcorp.Product.transform.WIN));
    ph.registerProduct('P', new tabcorp.Product('Place' , 0.12, tabcorp.Product.transform.PLACE));
    ph.registerProduct('E', new tabcorp.Product('Exacta', 0.18, tabcorp.Product.transform.EXACTA));

process.stdin.pipe(split())
    .on('Bet', function(bet) {
        ph.registerBet.apply(ph, bet);
    })
    .on('Result', function(result) {
        // map the dividends listings to the appropriate output string format
        var dividends = ph.calculateDividends(result)
            .map(function(div) {
                return div.slice(0, 2).join(':') + ':$' + div.slice(2, 3).shift().toFixed(2);
            });

        process.stdout.write(dividends.join('\n') + '\n');
    })
    .on('data', function(data) {
        if (!data) { return; }

        var tokens = data.split(':');
        this.emit(tokens[0], tokens.slice(1));
    });
