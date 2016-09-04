angular.module('lexacode.mercadopago', []).factory('mercadopago', ['$window', '$document', '$q', function ($window, $document, $q) {
    'use strict';
    var mp;

    function loadRender() {
        if ($window.$MPC_executed) {
            return $q.resolve($window.$MPC);
        }
        if (!$window.$MPC_loading) {
            $window.$MPC_loading = true;
            var deferred = $q.defer();
            // Loading the Mercadopago Render script.
            (function () {
                var e = $document[0].createElement('script');
                e.async = true;
                e.src = 'https://secure.mlstatic.com/mptools/render.js';
                // Handler when the Mercadopago is ready.
                e.onload = function () {
                    deferred.resolve($window.$MPC);
                    mp = $window.$MPC;
                };
                var s = $document[0].getElementsByTagName('script')[0];
                s.parentNode.insertBefore(e, s);
            }());
            return mp = deferred.promise;
        }
        return $q.when(mp);
    }

    return {
        loadRender: loadRender,
        openCheckout: function (opts) {
            return loadRender().then(function (mpc) {
                return $q(function (resolve, reject) {
                    mpc.openCheckout({
                        url: opts.url,
                        onreturn: function (data) {
                            switch (data.collection_status) {
                                case 'approved':
                                case 'pending':
                                case 'in_process':
                                    resolve(data);
                                    break;
                                default:
                                    reject(data);
                            }
                        }
                    });
                });
            });
        }
    };
}]);
